import { Global, Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";

@Global()
@Module({
  providers: [PrismaDatabaseService],
  exports: [PrismaDatabaseService],
})
export class DatabaseModule {}
