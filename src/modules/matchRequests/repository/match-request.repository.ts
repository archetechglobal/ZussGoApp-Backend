import { prisma } from "../../../config/prisma_client.ts";

export class MatchRequestRepository {

  create = async (senderId: string, receiverId: string, tripId: string, message?: string) => {
    return await prisma.matchRequest.create({
      data: { senderId, receiverId, tripId, message },
      include: {
        sender: { select: { id: true, fullName: true, profilePhotoUrl: true } },
        receiver: { select: { id: true, fullName: true, profilePhotoUrl: true } },
        trip: { include: { destination: { select: { name: true, emoji: true } } } },
      },
    });
  };

  findPendingForUser = async (userId: string) => {
    return await prisma.matchRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, profilePhotoUrl: true } },
        trip: { include: { destination: { select: { name: true, emoji: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  findSentByUser = async (userId: string) => {
    return await prisma.matchRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, fullName: true, age: true, city: true, travelStyle: true, profilePhotoUrl: true } },
        trip: { include: { destination: { select: { name: true, emoji: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  findById = async (id: string) => {
    return await prisma.matchRequest.findUnique({ where: { id } });
  };

  updateStatus = async (id: string, status: "ACCEPTED" | "REJECTED" | "CANCELLED") => {
    return await prisma.matchRequest.update({
      where: { id },
      data: { status },
    });
  };

  findExisting = async (senderId: string, receiverId: string, tripId: string) => {
    return await prisma.matchRequest.findUnique({
      where: { senderId_receiverId_tripId: { senderId, receiverId, tripId } },
    });
  };
}