import { prisma } from "../../../config/prisma_client.ts";

export class UsersService {

  getOtherUsers = async (currentUserId: string) => {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isProfileCompleted: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        gender: true,
        age: true,
        city: true,
        travelStyle: true,
        bio: true,
        profilePhotoUrl: true,
      },
    });

    return users;
  };

  getUserById = async (userId: string, currentUserId?: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trips: true,
        matchesAsUserA: { where: { isActive: true } },
        matchesAsUserB: { where: { isActive: true } },
        ratingsReceived: true,
      },
    });

    if (!user) return null;

    const tripsCount = user.trips.length;
    const friendsCount = user.matchesAsUserA.length + user.matchesAsUserB.length;
    const ratingSum = user.ratingsReceived.reduce((sum: number, r: any) => sum + r.score, 0);
    const avgRating = user.ratingsReceived.length > 0 ? (ratingSum / user.ratingsReceived.length).toFixed(1) : "New";

    // Build the final profile object matching frontend expectations
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      gender: user.gender,
      age: user.age,
      city: user.city,
      bio: user.bio,
      travelStyle: user.travelStyle,
      profilePhotoUrl: user.profilePhotoUrl,
      schedule: user.schedule,
      socialEnergy: user.socialEnergy,
      planningStyle: user.planningStyle,
      energyLevel: user.energyLevel,
      values: user.values,
      interests: user.interests,
      travelPriority: user.travelPriority,
      tripsCount,
      friendsCount,
      rating: avgRating,
    };
  };
}