import { Controller, Get, Header, Inject } from "@nestjs/common";
import type { SeedReviewContextDto } from "@rme/contracts";

import { SeedReviewContextService } from "@/modules/review-context/seed-review-context.service.js";

@Controller("review-context")
export class SeedReviewContextController {
  constructor(
    @Inject(SeedReviewContextService)
    private readonly seedReviewContextService: SeedReviewContextService,
  ) {}

  @Get("seed")
  @Header("Access-Control-Allow-Origin", "*")
  getSeedReviewContext(): SeedReviewContextDto {
    return this.seedReviewContextService.getSeedReviewContext();
  }
}
