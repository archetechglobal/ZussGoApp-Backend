import { MessageRepository } from "../repository/message.repository.ts";
import { ConversationRepository } from "../../conversations/repository/conversation.repository.ts";

export class MessageService {
  private repository = new MessageRepository();
  private conversationRepo = new ConversationRepository();

  send = async (conversationId: string, senderId: string, content: string) => {
    // Verify sender is part of this conversation
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const match = conversation.match;
    if (match.userAId !== senderId && match.userBId !== senderId) {
      throw new Error("Not authorized");
    }

    // Create message
    const message = await this.repository.create(conversationId, senderId, content);

    // Update conversation's last message
    await this.conversationRepo.updateLastMessage(conversationId, content);

    return message;
  };

  getMessages = async (conversationId: string, userId: string, limit?: number, cursor?: string) => {
    // Verify user is part of conversation
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const match = conversation.match;
    if (match.userAId !== userId && match.userBId !== userId) {
      throw new Error("Not authorized");
    }

    // Mark messages as read
    await this.repository.markAsRead(conversationId, userId);

    // Return messages (newest first)
    return await this.repository.findByConversationId(conversationId, limit, cursor);
  };

  getUnreadCount = async (userId: string) => {
    return await this.repository.getUnreadCount(userId);
  };
}