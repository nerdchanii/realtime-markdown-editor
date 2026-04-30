import { Controller, Get, Inject } from "@nestjs/common";
import type { SeedReviewContextDto } from "@rme/contracts";

import { assertDevSeedRouteEnabled } from "@/interfaces/http/dev-seed-route-gate.js";
import { SeedReviewContextService } from "@/modules/review-context/seed-review-context.service.js";

@Controller("review-context")
export class SeedReviewContextController {
  constructor(
    @Inject(SeedReviewContextService)
    private readonly seedReviewContextService: SeedReviewContextService,
  ) {}

  @Get("seed")
  getSeedReviewContext(): SeedReviewContextDto {
    assertDevSeedRouteEnabled();

    return this.seedReviewContextService.getSeedReviewContext();
  }
}
