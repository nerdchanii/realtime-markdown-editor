import { Injectable } from "@nestjs/common";
import type { SeedReviewContextDto } from "@rme/contracts";

import { mapSeedReviewContextToDto } from "@/modules/review-context/mappers/seed-review-context.mapper.js";
import { seedReviewContext } from "@/modules/review-context/seed-review-context.fixture.js";

@Injectable()
export class SeedReviewContextService {
  getSeedReviewContext(): SeedReviewContextDto {
    return mapSeedReviewContextToDto(seedReviewContext);
  }
}
