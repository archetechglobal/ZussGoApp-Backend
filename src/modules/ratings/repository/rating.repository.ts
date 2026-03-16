import { prisma } from "../../../config/prisma_client.ts";
import type { CreateRatingInput } from "../schemas/rating.schema.ts";

export class RatingRepository {

  create = async (raterId: string, input: CreateRatingInput) => {
    return await prisma.rating.create({
      data: {
        raterId,
        ratedId: input.ratedId,
        tripId: input.tripId,
        score: input.score,
        review: input.review,
        moodTags: input.moodTags || [],
      },
      include: {
        rater: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
    });
  };

  findByRatedUser = async (ratedId: string) => {
    return await prisma.rating.findMany({
      where: { ratedId },
      include: {
        rater: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  getAverageScore = async (ratedId: string) => {
    const result = await prisma.rating.aggregate({
      where: { ratedId },
      _avg: { score: true },
      _count: { score: true },
    });
    return {
      average: result._avg.score ? Math.round(result._avg.score * 10) / 10 : 0,
      totalRatings: result._count.score,
    };
  };

  findExisting = async (raterId: string, ratedId: string, tripId: string) => {
    return await prisma.rating.findUnique({
      where: { raterId_ratedId_tripId: { raterId, ratedId, tripId } },
    });
  };
}