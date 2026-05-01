export function isDirectMessagesEnabled() {
  const featureFlag = (globalThis as unknown as Record<string, boolean | string | undefined>)[
    "__FEATURE__DM__"
  ];

  if (typeof featureFlag === "boolean") return featureFlag;
  if (typeof featureFlag === "string") {
    return featureFlag.toLowerCase() === "true";
  }

  return false;
}
