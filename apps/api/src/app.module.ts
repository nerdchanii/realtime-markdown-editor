import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/database/database.module.js";
import { CollaborationModule } from "@/modules/collaboration/collaboration.module.js";
import { DocumentsModule } from "@/modules/documents/documents.module.js";
import { IdentityModule } from "@/modules/identity/identity.module.js";
import { WorkspaceModule } from "@/modules/workspace/workspace.module.js";

@Module({
  imports: [DatabaseModule, WorkspaceModule, IdentityModule, DocumentsModule, CollaborationModule],
})
export class AppModule {}
