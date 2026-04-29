import { Module } from "@nestjs/common";

import { SeedReviewContextController } from "@/modules/review-context/seed-review-context.controller.js";
import { SeedReviewContextService } from "@/modules/review-context/seed-review-context.service.js";

@Module({
  controllers: [SeedReviewContextController],
  providers: [SeedReviewContextService],
})
export class ReviewContextModule {}
