type ClassValue = string | number | false | null | undefined | ClassDictionary | ClassArray;
type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];

export function cn(...values: ClassValue[]) {
  return values.flatMap(normalizeClassValue).join(" ");
}

function normalizeClassValue(value: ClassValue): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(normalizeClassValue);
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([className]) => className);
  }

  return [String(value)];
}
