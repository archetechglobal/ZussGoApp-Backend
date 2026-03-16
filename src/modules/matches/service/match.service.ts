import { MatchRepository } from "../repository/match.repository.ts";

export class MatchService {
  private repository = new MatchRepository();

  getMyMatches = async (userId: string) => {
    const matches = await this.repository.findByUserId(userId);

    return matches.map((m: any) => {
      // Show the OTHER person, not yourself
      const otherUser = m.userAId === userId ? m.userB : m.userA;
      return {
        matchId: m.id,
        matchScore: m.matchScore,
        createdAt: m.createdAt,
        otherUser,
        trip: m.trip,
        conversation: m.conversation,
      };
    });
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