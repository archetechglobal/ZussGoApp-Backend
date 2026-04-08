import { MatchRepository } from "../repository/match.repository.ts";

export class MatchService {
  private repository = new MatchRepository();

  getMyMatches = async (userId: string) => {
    const matches = await this.repository.findByUserId(userId);

    const formatted = matches.map((m: any) => {
      // Show the OTHER person, not yourself
      const otherUser = m.userAId === userId ? m.userB : m.userA;
      
      let unreadCount = 0;
      if (m.conversation && m.conversation._count) {
        unreadCount = m.conversation._count.messages || 0;
      }

      return {
        matchId: m.id,
        matchScore: m.matchScore,
        createdAt: m.createdAt,
        otherUser,
        trip: m.trip,
        conversation: m.conversation,
        unreadCount,
      };
    });

    // Sort by most recent interaction (lastMessageAt fallback to createdAt)
    formatted.sort((a, b) => {
      const aTime = a.conversation?.lastMessageAt ? new Date(a.conversation.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.conversation?.lastMessageAt ? new Date(b.conversation.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return formatted;
  };

  getById = async (matchId: string) => {
    const match = await this.repository.findById(matchId);
    if (!match) throw new Error("Match not found");
    return match;
  };

  unmatch = async (matchId: string, userId: string) => {
    const match = await this.repository.findById(matchId);
    if (!match) throw new Error("Match not found");
    if (match.userAId !== userId && match.userBId !== userId) {
      throw new Error("Not authorized");
    }
    return await this.repository.deactivate(matchId);
  };
}