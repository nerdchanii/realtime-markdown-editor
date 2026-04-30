import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import {
  PrismaWorkspaceProductRepository,
  type PrismaWorkspaceProductPersistenceClient,
} from "@/modules/workspace/adapters/prisma-workspace-product-repository.js";
import { WorkspaceProductController } from "@/modules/workspace/interfaces/workspace-product.controller.js";
import {
  WORKSPACE_PRODUCT_REPOSITORY,
  type WorkspaceProductRepository,
} from "@/modules/workspace/ports/workspace-product-repository.js";
import { WorkspaceProductService } from "@/modules/workspace/use-cases/workspace-product-service.js";

@Module({
  controllers: [WorkspaceProductController],
  providers: [
    {
      provide: WORKSPACE_PRODUCT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaWorkspaceProductRepository(
          database as unknown as PrismaWorkspaceProductPersistenceClient,
        ),
      inject: [PrismaDatabaseService],
    },
    {
      provide: WorkspaceProductService,
      useFactory: (repository: WorkspaceProductRepository) =>
        new WorkspaceProductService(repository),
      inject: [WORKSPACE_PRODUCT_REPOSITORY],
    },
  ],
  exports: [WorkspaceProductService, WORKSPACE_PRODUCT_REPOSITORY],
})
export class WorkspaceModule {}
