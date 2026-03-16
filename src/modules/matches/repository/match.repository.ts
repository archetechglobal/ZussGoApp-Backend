import { prisma } from "../../../config/prisma_client.ts";

export class MatchRepository {

  findByUserId = async (userId: string) => {
    return await prisma.match.findMany({
      where: {
        isActive: true,
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
      include: {
        userA: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, profilePhotoUrl: true } },
        userB: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, profilePhotoUrl: true } },
        trip: { include: { destination: { select: { name: true, emoji: true, slug: true } } } },
        conversation: { select: { id: true, lastMessage: true, lastMessageAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  findById = async (matchId: string) => {
    return await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, bio: true, profilePhotoUrl: true } },
        userB: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, bio: true, profilePhotoUrl: true } },
        trip: { include: { destination: true } },
        conversation: { select: { id: true } },
      },
    });
  };

  deactivate = async (matchId: string) => {
    return await prisma.match.update({
      where: { id: matchId },
      data: { isActive: false },
    });
  };
}