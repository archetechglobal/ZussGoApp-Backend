import { ConversationRepository } from "../repository/conversation.repository.ts";

export class ConversationService {
  private repository = new ConversationRepository();

  getMyConversations = async (userId: string) => {
    const conversations = await this.repository.findByUserId(userId);

    return conversations.map((c: any) => {
      const otherUser = c.match.userAId === userId ? c.match.userB : c.match.userA;
      return {
        conversationId: c.id,
        matchId: c.matchId,
        otherUser,
        trip: c.match.trip,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    });
  };

  getById = async (conversationId: string, userId: string) => {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.match.userAId !== userId && conversation.match.userBId !== userId) {
      throw new Error("Not authorized");
    }

    return conversation;
  };
}