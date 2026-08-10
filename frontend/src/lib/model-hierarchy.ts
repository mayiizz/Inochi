export type ModelPart = {
  id: string;
  label: string;
  children: ModelPart[];
};

function isAnnotation(name: string) {
  return /\.[jti]$/i.test(name);
}

export function shouldSkip(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("?")) return true;
  if (trimmed.startsWith("Cross Section")) return true;
  if (isAnnotation(trimmed)) return true;
  return false;
}

export function isSelectableName(name: string) {
  return Boolean(name) && !shouldSkip(name) && name !== "Scene" && !name.startsWith("Root");
}

export function displayPartLabel(name: string) {
  return name
    .replace(/\.001$/, "")
    .replace(/\.g$/i, "")
    .replace(/\.l$/i, " (L)")
    .replace(/\.r$/i, " (R)")
    .trim();
}

type NamedObject = {
  name: string;
  children: NamedObject[];
};

export function buildPartTree(root: NamedObject, isolateNames: string[] = []): ModelPart[] {
  const starts =
    isolateNames.length > 0
      ? isolateNames
          .map((name) => findNamed(root, name))
          .filter((node): node is NamedObject => Boolean(node))
      : root.children;

  return starts.map(toPart).filter((part): part is ModelPart => Boolean(part));
}

function findNamed(node: NamedObject, name: string): NamedObject | null {
  if (node.name === name) return node;
  for (const child of node.children) {
    const found = findNamed(child, name);
    if (found) return found;
  }
  return null;
}

function toPart(node: NamedObject): ModelPart | null {
  if (shouldSkip(node.name)) return null;
  const children = node.children.map(toPart).filter((part): part is ModelPart => Boolean(part));
  return {
    id: node.name,
    label: displayPartLabel(node.name),
    children,
  };
}
