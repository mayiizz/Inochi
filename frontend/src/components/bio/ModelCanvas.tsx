import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import type { Material, Mesh, Object3D, PerspectiveCamera } from "three";
import { Box3, BufferGeometry, Color, Group, Spherical, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  buildPartTree,
  isAnnotationName,
  isGroupFolderName,
  isSelectableName,
  namesMatch,
  sourceName,
  type ModelPart,
} from "@/lib/model-hierarchy";
import type { CameraCommand } from "@/lib/types";
import { TutorAnchor } from "./FloatingTutor";

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

const EMPTY_GEOMETRY = new BufferGeometry();
let lastPartPickAt = 0;

function pickSelectableName(object: Object3D) {
  let current: Object3D | null = object;
  while (current) {
    const name = sourceName(current);
    if (isSelectableName(name)) return name;
    current = current.parent;
  }
  return null;
}

function isInSelection(object: Object3D, selectedName: string) {
  let current: Object3D | null = object;
  while (current) {
    if (namesMatch(sourceName(current), selectedName) || namesMatch(current.name, selectedName)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function enhanceMaterials(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const original = sourceName(mesh);
    if (isAnnotationName(original) || isGroupFolderName(original)) return;
    if (!mesh.geometry.getAttribute("position")) return;
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

function findObject(root: Object3D, name: string) {
  let match: Object3D | undefined;
  root.traverse((node) => {
    if (match) return;
    if (namesMatch(sourceName(node), name) || namesMatch(node.name, name)) match = node;
  });
  return match;
}

function stripEmbeddedLabels(root: Object3D) {
  root.traverse((node) => {
    const original = sourceName(node);
    if (isAnnotationName(original)) {
      node.visible = false;
      return;
    }
    const mesh = node as Mesh;
    if (!mesh.isMesh || !isGroupFolderName(original)) return;
    mesh.geometry = EMPTY_GEOMETRY;
    mesh.raycast = () => {};
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function extractIsolated(source: Object3D, names: string[]) {
  stripEmbeddedLabels(source);
  if (names.length === 0) return source;

  const container = new Group();
  container.name = "IsolatedParts";
  for (const name of names) {
    const found = findObject(source, name);
    if (!found) continue;
    container.add(clone(found));
  }

  if (container.children.length === 0) return source;
  stripEmbeddedLabels(container);
  return container;
}

function toNamed(node: Object3D): { name: string; children: ReturnType<typeof toNamed>[] } {
  return {
    name: sourceName(node),
    children: node.children.map(toNamed),
  };
}

function frameBox(root: Object3D, target: Object3D) {
  const box = new Box3().setFromObject(target);
  if (box.isEmpty()) return box;

  const size = new Vector3();
  box.getSize(size);
  const targetExtent = Math.max(size.x, size.y, size.z, 1e-4);
  box.expandByScalar(targetExtent * 0.18);
  return box;
}

function fitCameraToBox(camera: PerspectiveCamera, box: Box3, margin: number) {
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 1e-4);
  const fitHeight = maxSize / (2 * Math.tan((Math.PI * camera.fov) / 360));
  const fitWidth = fitHeight / Math.max(camera.aspect, 0.0001);
  const distance = margin * Math.max(fitHeight, fitWidth);
  const direction = camera.position.clone().sub(center);
  if (direction.lengthSq() < 1e-8) direction.set(1.2, 0.6, 1.6);
  direction.normalize();
  return {
    position: center.clone().addScaledVector(direction, distance),
    target: center,
  };
}

type OrbitLike = {
  target: Vector3;
  update: () => void;
};

function FocusOnSelection({
  root,
  selectedName,
  cameraCommand,
}: {
  root: Object3D;
  selectedName: string | null;
  cameraCommand: CameraCommand | null;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const invalidate = useThree((state) => state.invalidate);
  const didInitial = useRef(false);
  const prevSelected = useRef<string | null>(null);
  const prevCommand = useRef(0);
  const anim = useRef<{
    t: number;
    fromPos: Vector3;
    fromTarget: Vector3;
    toPos: Vector3;
    toTarget: Vector3;
  } | null>(null);

  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    if (!("isPerspectiveCamera" in cam) || !cam.isPerspectiveCamera) return;
    const orbit = controls as OrbitLike | null;
    if (!orbit?.target) return;

    const startFit = (box: Box3, margin: number) => {
      if (box.isEmpty()) return;
      const goal = fitCameraToBox(cam, box, margin);
      anim.current = {
        t: 0,
        fromPos: cam.position.clone(),
        fromTarget: orbit.target.clone(),
        toPos: goal.position,
        toTarget: goal.target,
      };
      invalidate();
    };

    if (cameraCommand && cameraCommand.id !== prevCommand.current) {
      prevCommand.current = cameraCommand.id;
      if (cameraCommand.kind === "reset") {
        startFit(new Box3().setFromObject(root), 1.4);
        return;
      }
      if (cameraCommand.kind === "focus") {
        const target = findObject(root, cameraCommand.part);
        if (target) startFit(frameBox(root, target), 1.25);
        return;
      }
      if (cameraCommand.kind === "rotate") {
        const offset = cam.position.clone().sub(orbit.target);
        const spherical = new Spherical().setFromVector3(offset);
        spherical.theta += cameraCommand.yaw;
        spherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, spherical.phi + cameraCommand.pitch));
        const next = new Vector3().setFromSpherical(spherical).add(orbit.target);
        anim.current = {
          t: 0,
          fromPos: cam.position.clone(),
          fromTarget: orbit.target.clone(),
          toPos: next,
          toTarget: orbit.target.clone(),
        };
        invalidate();
        return;
      }
    }

    if (!didInitial.current) {
      didInitial.current = true;
      prevSelected.current = selectedName;
      startFit(new Box3().setFromObject(root), 1.4);
      return;
    }

    if (!selectedName || selectedName === prevSelected.current) {
      prevSelected.current = selectedName;
      return;
    }

    prevSelected.current = selectedName;
    const target = findObject(root, selectedName);
    if (!target) return;
    startFit(frameBox(root, target), 1.25);
  }, [camera, cameraCommand, controls, invalidate, root, selectedName]);

  useFrame((_, delta) => {
    const current = anim.current;
    if (!current) return;
    current.t = Math.min(1, current.t + delta / 0.4);
    const k = 1 - (1 - current.t) ** 3;
    camera.position.lerpVectors(current.fromPos, current.toPos, k);
    const orbit = controls as OrbitLike | null;
    if (orbit?.target) {
      orbit.target.lerpVectors(current.fromTarget, current.toTarget, k);
      orbit.update();
    }
    camera.updateMatrixWorld();
    invalidate();
    if (current.t >= 1) anim.current = null;
  });

  return null;
}

function applyVisibility(root: Object3D, hiddenNames: string[]) {
  root.traverse((node) => {
    if (isAnnotationName(sourceName(node))) {
      node.visible = false;
      return;
    }
    node.visible = true;
  });
  for (const name of hiddenNames) {
    const found = findObject(root, name);
    if (found) found.visible = false;
  }
}

function GltfModel({
  url,
  isolateNodes,
  selectedName,
  hiddenNames,
  cameraCommand,
  floatingGuide,
  onSelect,
  onHierarchy,
}: {
  url: string;
  isolateNodes: string[];
  selectedName: string | null;
  hiddenNames: string[];
  cameraCommand: CameraCommand | null;
  floatingGuide?: ReactNode;
  onSelect?: ((name: string | null) => void) | undefined;
  onHierarchy?: ((parts: ModelPart[]) => void) | undefined;
}) {
  const { scene } = useGLTF(url);
  const isolateKey = isolateNodes.join("|");
  const hiddenKey = hiddenNames.join("|");
  const pointer = useRef({ x: 0, y: 0 });
  const cloned = useMemo(() => {
    const copy = clone(scene);
    const isolated = extractIsolated(copy, isolateNodes);
    enhanceMaterials(isolated);
    return isolated;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isolateKey captures isolateNodes
  }, [scene, isolateKey]);

  useEffect(() => {
    onHierarchy?.(buildPartTree(toNamed(cloned), isolateNodes));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isolateKey captures isolateNodes
  }, [cloned, isolateKey, onHierarchy]);

  useEffect(() => {
    applyVisibility(cloned, hiddenNames);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hiddenKey captures hiddenNames
  }, [cloned, hiddenKey]);

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
    lastPartPickAt = performance.now();
    if (!name || name === selectedName) {
      onSelect?.(null);
      return;
    }
    onSelect?.(name);
  }

  return (
    <>
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
      <FocusOnSelection root={cloned} selectedName={selectedName} cameraCommand={cameraCommand} />
      {selectedName && floatingGuide ? (
        <TutorAnchor root={cloned} selectedName={selectedName}>
          {floatingGuide}
        </TutorAnchor>
      ) : null}
    </>
  );
}

export default function ModelCanvas({
  src,
  isolateNodes = [],
  selectedName = null,
  hiddenNames = [],
  cameraCommand = null,
  floatingGuide,
  onSelect,
  onHierarchy,
}: {
  src: string;
  isolateNodes?: string[];
  selectedName?: string | null;
  hiddenNames?: string[];
  cameraCommand?: CameraCommand | null;
  floatingGuide?: ReactNode;
  onSelect?: ((name: string | null) => void) | undefined;
  onHierarchy?: ((parts: ModelPart[]) => void) | undefined;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [2.6, 1.5, 3.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      style={{ width: "100%", height: "100%" }}
      onPointerMissed={() => {
        if (performance.now() - lastPartPickAt < 250) return;
        onSelect?.(null);
      }}
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
          hiddenNames={hiddenNames}
          cameraCommand={cameraCommand}
          floatingGuide={floatingGuide}
          onSelect={onSelect}
          onHierarchy={onHierarchy}
        />
      </Suspense>
      <ContactShadows opacity={0.38} scale={12} blur={2.4} far={6} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.01}
        maxDistance={500}
        zoomSpeed={1.1}
      />
    </Canvas>
  );
}

useGLTF.preload("/heart2.glb");
useGLTF.preload("/visceralsystem.glb");
useGLTF.preload("/skeleton.glb");
useGLTF.preload("/nervous_system.glb");
