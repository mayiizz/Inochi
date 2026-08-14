export type ModelPart = {
  id: string;
  label: string;
  children: ModelPart[];
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

export function shouldSkip(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return true;
  if (trimmed === "IsolatedParts" || trimmed === "Scene") return true;
  if (trimmed.startsWith("?")) return true;
  if (trimmed.startsWith("Cross Section")) return true;
  if (isAnnotationName(trimmed)) return true;
  return false;
}

export function isSelectableName(name: string) {
  return Boolean(name) && !shouldSkip(name) && !name.startsWith("Root");
}

export function displayPartLabel(name: string) {
  return name
    .replace(/\.001$/, "")
    .replace(/\.g$/i, "")
    .replace(/\.l$/i, " (L)")
    .replace(/\.r$/i, " (R)")
    .replace(/_/g, " ")
    .replace(/\d+$/, "")
    .replace(/\s+/g, " ")
    .trim();
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
  let starts = root.children;

  if (isolateNames.length > 0) {
    const found = isolateNames
      .map((name) => findNamed(root, name))
      .filter((node): node is NamedObject => Boolean(node));
    if (found.length === 1 && found[0]) starts = found[0].children;
    else if (found.length > 1) starts = found;
  } else if (root.name === "IsolatedParts" && starts.length === 1 && starts[0]) {
    starts = starts[0].children;
  }

  return starts.map(toPart).filter((part): part is ModelPart => Boolean(part));
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
