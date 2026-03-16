import { prisma } from "../../../config/prisma_client.ts";
import { MatchRequestRepository } from "../repository/match-request.repository.ts";

export class MatchRequestService {
  private repository = new MatchRequestRepository();

  send = async (senderId: string, receiverId: string, tripId: string, message?: string) => {
    if (senderId === receiverId) throw new Error("Cannot send request to yourself");

    const existing = await this.repository.findExisting(senderId, receiverId, tripId);
    if (existing) throw new Error("Match request already sent");

    return await this.repository.create(senderId, receiverId, tripId, message);
  };

  getPendingRequests = async (userId: string) => {
    return await this.repository.findPendingForUser(userId);
  };

  getSentRequests = async (userId: string) => {
    return await this.repository.findSentByUser(userId);
  };

  accept = async (requestId: string, userId: string) => {
    const request = await this.repository.findById(requestId);
    if (!request) throw new Error("Request not found");
    if (request.receiverId !== userId) throw new Error("Not authorized");
    if (request.status !== "PENDING") throw new Error("Request is no longer pending");

    // Accept request + create Match + create Conversation in one transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update request status
      await tx.matchRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Create match
      const match = await tx.match.create({
        data: {
          userAId: request.senderId,
          userBId: request.receiverId,
          tripId: request.tripId,
        },
      });

      // Create conversation for this match
      const conversation = await tx.conversation.create({
        data: { matchId: match.id },
      });

      return { match, conversation };
    });

    return result;
  };

  reject = async (requestId: string, userId: string) => {
    const request = await this.repository.findById(requestId);
    if (!request) throw new Error("Request not found");
    if (request.receiverId !== userId) throw new Error("Not authorized");
    if (request.status !== "PENDING") throw new Error("Request is no longer pending");

    return await this.repository.updateStatus(requestId, "REJECTED");
  };

  cancel = async (requestId: string, userId: string) => {
    const request = await this.repository.findById(requestId);
    if (!request) throw new Error("Request not found");
    if (request.senderId !== userId) throw new Error("Not authorized");
    if (request.status !== "PENDING") throw new Error("Request is no longer pending");

    return await this.repository.updateStatus(requestId, "CANCELLED");
  };
}