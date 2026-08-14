export type ModelPart = {
  id: string;
  label: string;
  children: ModelPart[];
};

const RIBOSOMES_ID = "Ribosomes";

const LABEL_ALIASES: Record<string, string> = {
  "Sphere.002_17": "Plasma membrane",
  "Sphere.005_8": "Mitochondrion",
  Sphere_13: "Nucleus",
  Icosphere_16: "Nucleolus",
  "Sphere.001_18": "Nuclear envelope",
  "BezierCurve_15": "Rough ER",
  "BezierCurve.002_14": "Smooth ER",
  "Roundcube.001_11": "Golgi apparatus",
  "Roundcube.000_12": "Cytoplasm",
  Roundcube_10: "Lysosome",
  "Icosphere.002_9": "Centrosome",
  "BezierCurve.005_25": "Centriole",
  "BezierCurve.004_26": "Centriole",
  "BezierCurve.006_27": "Centriole",
  "Sphere.008_0": "Lysosome",
  "Sphere.010_1": "Peroxisome",
  "Sphere.012_3": "Secretory vesicle",
  "Sphere.013_4": "Endosome",
  "Sphere.015_5": "Vesicle",
  "Sphere.017_6": "Vesicle",
  "Sphere.020_19": "Vesicle",
  "Sphere.021_20": "Vesicle",
  "Sphere.022_21": "Vesicle",
  "golgi.appratus": "Golgi apparatus",
  "chloroplast.in": "Chloroplast (inner)",
  "chloroplast.out": "Chloroplast (outer)",
  "rough.ER": "Rough ER",
  "smooth.ER": "Smooth ER",
  plasmodesma: "Plasmodesma",
  cell: "Cell wall",
  cytoplasm: "Cytoplasm",
  nucleus: "Nucleus",
  ribosomes: "Ribosomes",
  lysosome: "Lysosome",
  peroxisome: "Peroxisome",
  vacuole: "Vacuole",
  mitochondria: "Mitochondria",
  shell: "Outer membrane",
  cristae: "Cristae",
  matrix: "Matrix",
};

export function sourceName(node: { name: string; userData?: { name?: unknown } }) {
  const original = node.userData?.name;
  return typeof original === "string" && original.trim() ? original : node.name;
}

export function isAnnotationName(name: string) {
  return /\.[jti]$/i.test(name.trim());
}

export function isGroupFolderName(name: string) {
  return /\.g$/i.test(name.trim());
}

export function isBakedLabelName(name: string) {
  return /^Mesh_\d+$/i.test(name.trim());
}

export function isWrapperName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return true;
  if (trimmed === "IsolatedParts" || trimmed === "Scene" || trimmed === "root") return true;
  if (trimmed === "Sketchfab_model" || trimmed === "GLTF_SceneRootNode") return true;
  if (trimmed === "RootNode" || trimmed.startsWith("Root")) return true;
  if (/\.fbx$/i.test(trimmed)) return true;
  return false;
}

export function isRibosomeInstance(name: string) {
  const normalized = name.trim().replace(/\./g, "_");
  if (normalized === "Sphere_011_2") return true;
  const match = normalized.match(/^Sphere_\d+_(\d+)$/);
  return Boolean(match && Number(match[1]) >= 22);
}

export function normalizePartName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.g$/i, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function namesMatch(a: string, b: string) {
  return normalizePartName(a) === normalizePartName(b);
}

export function partMatches(nodeName: string, query: string) {
  if (namesMatch(nodeName, query)) return true;
  if (namesMatch(query, RIBOSOMES_ID) && isRibosomeInstance(nodeName)) return true;
  return false;
}

export function shouldSkip(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return true;
  if (isWrapperName(trimmed)) return true;
  if (trimmed.startsWith("?")) return true;
  if (trimmed.startsWith("Cross Section")) return true;
  if (isAnnotationName(trimmed) || isBakedLabelName(trimmed)) return true;
  if (/TT_checker|UV_GRID/i.test(trimmed)) return true;
  if (/^Object_\d+$/i.test(trimmed)) return true;
  if (isRibosomeInstance(trimmed)) return true;
  return false;
}

export function isSelectableName(name: string) {
  if (namesMatch(name, RIBOSOMES_ID)) return true;
  if (isRibosomeInstance(name)) return true;
  return Boolean(name) && !shouldSkip(name) && !name.startsWith("Root");
}

export function canonicalPartName(name: string) {
  if (isRibosomeInstance(name) || namesMatch(name, RIBOSOMES_ID)) return RIBOSOMES_ID;
  return name;
}

export function displayPartLabel(name: string) {
  if (namesMatch(name, RIBOSOMES_ID) || isRibosomeInstance(name)) return "Ribosomes";
  const sanitized = name.replace(/\./g, "_");
  const alias =
    LABEL_ALIASES[name] ??
    LABEL_ALIASES[name.trim()] ??
    LABEL_ALIASES[sanitized] ??
    Object.entries(LABEL_ALIASES).find(([key]) => key.replace(/\./g, "_") === sanitized)?.[1];
  if (alias) return alias;
  const cleaned = name
    .replace(/\.001$/, "")
    .replace(/\.g$/i, "")
    .replace(/\.l$/i, " (L)")
    .replace(/\.r$/i, " (R)")
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\d+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/^dna$/i.test(cleaned)) return "Mitochondrial DNA";
  if (/^granule$/i.test(cleaned)) return "Granule";
  return cleaned;
}

export function collectPartIds(part: ModelPart): string[] {
  return [part.id, ...part.children.flatMap(collectPartIds)];
}

export function flattenParts(parts: ModelPart[]): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const part of parts) {
    out.push({ id: part.id, label: part.label });
    out.push(...flattenParts(part.children));
  }
  return out;
}

export function resolvePartId(parts: ModelPart[], query: string): string | null {
  const all = flattenParts(parts);
  const exact = all.find((part) => namesMatch(part.id, query) || namesMatch(part.label, query));
  if (exact) return exact.id;
  const want = normalizePartName(query);
  if (!want) return null;
  const fuzzy = all.find(
    (part) =>
      normalizePartName(part.label).includes(want) || want.includes(normalizePartName(part.label)),
  );
  return fuzzy?.id ?? null;
}

export function findPart(parts: ModelPart[], id: string): ModelPart | null {
  for (const part of parts) {
    if (part.id === id) return part;
    const nested = findPart(part.children, id);
    if (nested) return nested;
  }
  return null;
}

type NamedObject = {
  name: string;
  children: NamedObject[];
};

export function buildPartTree(root: NamedObject, isolateNames: string[] = []): ModelPart[] {
  let starts = unwrapWrappers(root);

  if (isolateNames.length > 0) {
    const found = isolateNames
      .map((name) => findNamed(root, name))
      .filter((node): node is NamedObject => Boolean(node));
    if (found.length === 1 && found[0]) starts = unwrapWrappers(found[0]);
    else if (found.length > 1) starts = found;
  }

  const parts = starts.map(toPart).filter((part): part is ModelPart => Boolean(part));
  if (containsRibosomes(root) && !parts.some((part) => namesMatch(part.id, RIBOSOMES_ID))) {
    parts.push({ id: RIBOSOMES_ID, label: "Ribosomes", children: [] });
  }
  return parts;
}

function unwrapWrappers(node: NamedObject): NamedObject[] {
  let current = node;
  while (isWrapperName(current.name) && current.children.length === 1 && current.children[0]) {
    current = current.children[0];
  }
  if (isWrapperName(current.name) && current.children.length > 0) return current.children;
  return current.children.length > 0 ? current.children : [current];
}

function containsRibosomes(node: NamedObject): boolean {
  if (isRibosomeInstance(node.name)) return true;
  return node.children.some(containsRibosomes);
}

function findNamed(node: NamedObject, name: string): NamedObject | null {
  if (namesMatch(node.name, name)) return node;
  for (const child of node.children) {
    const found = findNamed(child, name);
    if (found) return found;
  }
  return null;
}

function toPart(node: NamedObject): ModelPart | null {
  if (shouldSkip(node.name)) return null;
  const children = node.children.map(toPart).filter((part): part is ModelPart => Boolean(part));
  if (isGroupFolderName(node.name) && children.length === 0) return null;
  return {
    id: node.name,
    label: displayPartLabel(node.name),
    children,
  };
}
