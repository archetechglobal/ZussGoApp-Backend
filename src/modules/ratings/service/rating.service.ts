import { RatingRepository } from "../repository/rating.repository.ts";
import type { CreateRatingInput } from "../schemas/rating.schema.ts";
import { RewardsService } from "../../rewards/service/rewards.service.ts";

export class RatingService {
  private repository = new RatingRepository();
  private rewardsService = new RewardsService();

  create = async (raterId: string, input: CreateRatingInput) => {
    if (raterId === input.ratedId) throw new Error("Cannot rate yourself");

    const existing = await this.repository.findExisting(raterId, input.ratedId, input.tripId);
    if (existing) throw new Error("Already rated this person for this trip");

    const result = await this.repository.create(raterId, input);

    // Award +25 TP for giving a rating
    try {
      await this.rewardsService.earnForAction(raterId, "RATING_GIVEN", result.id);
    } catch (e) {
      console.error("Failed to award rating points:", e);
    }

    return result;
  };

  getUserRatings = async (userId: string) => {
    const ratings = await this.repository.findByRatedUser(userId);
    const stats = await this.repository.getAverageScore(userId);
    return { ratings, stats };
  };
}