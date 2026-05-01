declare const __FEATURE__DM__: boolean | string | undefined;

export function isDirectMessagesEnabled() {
  if (typeof __FEATURE__DM__ === "boolean") return __FEATURE__DM__;
  if (typeof __FEATURE__DM__ === "string") {
    return __FEATURE__DM__.toLowerCase() === "true";
  }

  return false;
}
