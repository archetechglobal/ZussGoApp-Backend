import { RatingRepository } from "../repository/rating.repository.ts";
import type { CreateRatingInput } from "../schemas/rating.schema.ts";

export class RatingService {
  private repository = new RatingRepository();

  create = async (raterId: string, input: CreateRatingInput) => {
    if (raterId === input.ratedId) throw new Error("Cannot rate yourself");

    const existing = await this.repository.findExisting(raterId, input.ratedId, input.tripId);
    if (existing) throw new Error("Already rated this person for this trip");

    return await this.repository.create(raterId, input);
  };

  getUserRatings = async (userId: string) => {
    const ratings = await this.repository.findByRatedUser(userId);
    const stats = await this.repository.getAverageScore(userId);
    return { ratings, stats };
  };
}