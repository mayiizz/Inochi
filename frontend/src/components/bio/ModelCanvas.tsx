import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Html,
  OrbitControls,
  useBounds,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import type { Material, Mesh, Object3D } from "three";
import { Color, Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { buildPartTree, isSelectableName, type ModelPart } from "@/lib/model-hierarchy";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-2xl border border-[var(--glass-border)] bg-white/85 px-4 py-3 text-center text-xs font-medium text-muted-foreground backdrop-blur-xl dark:bg-black/50">
        Loading 3D model
        <div className="mt-2 h-1 w-36 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 tabular-nums">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

function isAnnotation(name: string) {
  return name.endsWith(".j") || name.endsWith(".t") || name.endsWith(".i");
}

function pickSelectableName(object: Object3D) {
  let current: Object3D | null = object;
  while (current) {
    if (isSelectableName(current.name)) return current.name;
    current = current.parent;
  }
  return null;
}

function isInSelection(object: Object3D, selectedName: string) {
  let current: Object3D | null = object;
  while (current) {
    if (current.name === selectedName) return true;
    current = current.parent;
  }
  return false;
}

function enhanceMaterials(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const apply = (material: Material) => {
      const next = material.clone();
      const color = "color" in next ? (next.color as Color | undefined) : undefined;
      if (color) {
        const luma = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        if (luma > 0.78) color.multiplyScalar(0.62);
      }
      if ("roughness" in next) {
        next.roughness = Math.min(0.85, Math.max(0.42, Number(next.roughness) || 0.55));
      }
      if ("metalness" in next) {
        next.metalness = Math.min(0.12, Number(next.metalness) || 0.04);
      }
      if ("emissive" in next && next.emissive instanceof Color) {
        next.emissive.set("#000000");
      }
      if ("emissiveIntensity" in next) {
        next.emissiveIntensity = 0;
      }
      next.needsUpdate = true;
      return next;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(apply) : apply(mesh.material);
  });
}

function highlightSelection(root: Object3D, selectedName: string | null) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const active = Boolean(selectedName && isInSelection(mesh, selectedName));
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if ("emissive" in material && material.emissive instanceof Color) {
        material.emissive.set(active ? "#1a7aa8" : "#000000");
      }
      if ("emissiveIntensity" in material) {
        material.emissiveIntensity = active ? 0.55 : 0;
      }
    }
  });
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+g$/, "")
    .trim();
}

function findObject(root: Object3D, name: string) {
  const exact = root.getObjectByName(name);
  if (exact) return exact;
  const want = normalizeName(name);
  let match: Object3D | undefined;
  root.traverse((node) => {
    if (match || !node.name) return;
    if (normalizeName(node.name) === want) match = node;
  });
  return match;
}

function hideAnnotations(root: Object3D) {
  root.traverse((node) => {
    if (isAnnotation(node.name)) node.visible = false;
  });
}

function extractIsolated(source: Object3D, names: string[]) {
  hideAnnotations(source);
  if (names.length === 0) return source;

  const container = new Group();
  container.name = "IsolatedParts";
  for (const name of names) {
    const found = findObject(source, name);
    if (!found) continue;
    container.add(clone(found));
  }

  if (container.children.length === 0) return source;
  hideAnnotations(container);
  return container;
}

function toNamed(node: Object3D): { name: string; children: ReturnType<typeof toNamed>[] } {
  return {
    name: node.name,
    children: node.children.map(toNamed),
  };
}

function FitToSelection({
  root,
  selectedName,
}: {
  root: Object3D;
  selectedName: string | null;
}) {
  const bounds = useBounds();

  useEffect(() => {
    const target = selectedName ? root.getObjectByName(selectedName) : root;
    if (!target) return;
    bounds.refresh(target).fit();
  }, [bounds, root, selectedName]);

  return null;
}

function GltfModel({
  url,
  isolateNodes,
  selectedName,
  onSelect,
  onHierarchy,
}: {
  url: string;
  isolateNodes: string[];
  selectedName: string | null;
  onSelect?: (name: string | null) => void;
  onHierarchy?: (parts: ModelPart[]) => void;
}) {
  const { scene } = useGLTF(url);
  const isolateKey = isolateNodes.join("|");
  const pointer = useRef({ x: 0, y: 0 });
  const cloned = useMemo(() => {
    const copy = clone(scene);
    const isolated = extractIsolated(copy, isolateNodes);
    enhanceMaterials(isolated);
    return isolated;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isolateKey captures isolateNodes
  }, [scene, isolateKey]);

  useEffect(() => {
    onHierarchy?.(buildPartTree(toNamed(cloned), []));
  }, [cloned, onHierarchy]);

  useEffect(() => {
    highlightSelection(cloned, selectedName);
  }, [cloned, selectedName]);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    pointer.current = { x: event.clientX, y: event.clientY };
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    if (Math.hypot(dx, dy) > 5) return;
    event.stopPropagation();
    const name = pickSelectableName(event.object);
    if (!name || name === selectedName) {
      onSelect?.(null);
      return;
    }
    onSelect?.(name);
  }

  return (
    <Bounds fit observe margin={1.2}>
      <Center>
        <group
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <primitive object={cloned} />
        </group>
      </Center>
      <FitToSelection root={cloned} selectedName={selectedName} />
    </Bounds>
  );
}

export default function ModelCanvas({
  src,
  isolateNodes = [],
  selectedName = null,
  onSelect,
  onHierarchy,
}: {
  src: string;
  isolateNodes?: string[];
  selectedName?: string | null;
  onSelect?: (name: string | null) => void;
  onHierarchy?: (parts: ModelPart[]) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [2.6, 1.5, 3.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      style={{ width: "100%", height: "100%" }}
      onPointerMissed={() => onSelect?.(null)}
    >
      <color attach="background" args={["#c5d5e4"]} />
      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#eef6ff", "#6d7f90", 0.45]} />
      <directionalLight position={[5.5, 8, 4.5]} intensity={1.85} castShadow />
      <directionalLight position={[-5, 2.5, -3]} intensity={0.55} />
      <directionalLight position={[0, 3.5, -6]} intensity={0.7} />
      <Suspense fallback={<Loader />}>
        <GltfModel
          url={src}
          isolateNodes={isolateNodes}
          selectedName={selectedName}
          onSelect={onSelect}
          onHierarchy={onHierarchy}
        />
      </Suspense>
      <ContactShadows opacity={0.38} scale={12} blur={2.4} far={6} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.2}
        maxDistance={80}
      />
    </Canvas>
  );
}

useGLTF.preload("/heart2.glb");
useGLTF.preload("/visceralsystem.glb");
useGLTF.preload("/skeleton.glb");
useGLTF.preload("/nervous_system.glb");
