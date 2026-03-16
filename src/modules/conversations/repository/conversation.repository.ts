import { prisma } from "../../../config/prisma_client.ts";

export class ConversationRepository {

  findByUserId = async (userId: string) => {
    return await prisma.conversation.findMany({
      where: {
        match: {
          isActive: true,
          OR: [
            { userAId: userId },
            { userBId: userId },
          ],
        },
      },
      include: {
        match: {
          include: {
            userA: { select: { id: true, fullName: true, profilePhotoUrl: true } },
            userB: { select: { id: true, fullName: true, profilePhotoUrl: true } },
            trip: { include: { destination: { select: { name: true, emoji: true } } } },
          },
        },
      },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
    });
  };

  findById = async (conversationId: string) => {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        match: {
          include: {
            userA: { select: { id: true, fullName: true, profilePhotoUrl: true } },
            userB: { select: { id: true, fullName: true, profilePhotoUrl: true } },
            trip: { include: { destination: { select: { name: true, emoji: true } } } },
          },
        },
      },
    });
  };

  updateLastMessage = async (conversationId: string, message: string) => {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: message,
        lastMessageAt: new Date(),
      },
    });
  };
}