import { prisma } from "../../../config/prisma_client.ts";

export class MessageRepository {

  create = async (conversationId: string, senderId: string, content: string) => {
    return await prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
    });
  };

  findByConversationId = async (conversationId: string, limit = 50, cursor?: string) => {
    return await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  };

  markAsRead = async (conversationId: string, userId: string) => {
    return await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  };

  getUnreadCount = async (userId: string) => {
    return await prisma.message.count({
      where: {
        senderId: { not: userId },
        isRead: false,
        conversation: {
          match: {
            isActive: true,
            OR: [
              { userAId: userId },
              { userBId: userId },
            ],
          },
        },
      },
    });
  };
}