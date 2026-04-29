export const documentStates = ["draft", "review", "saved"] as const;

export type DocumentState = (typeof documentStates)[number];
