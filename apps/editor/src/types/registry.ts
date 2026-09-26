import type { DocumentType, TypeModule } from "../core/document";

import { markdownType } from "./markdown/module";

export const typeModules: Record<DocumentType, TypeModule> = {
  markdown: markdownType,
};
