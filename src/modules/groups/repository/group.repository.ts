import { prisma } from "../../../config/prisma_client.ts";
import type { CreateGroupInput } from "../schemas/group.schema.ts";
 
export class GroupRepository {
  create = async (creatorId: string, input: CreateGroupInput) => {
    return await prisma.$transaction(async (tx: any) => {
      const group = await tx.groupTrip.create({
        data: {
          name: input.name, destinationId: input.destinationId,
          startDate: new Date(input.startDate), endDate: new Date(input.endDate),
          budget: input.budget, maxMembers: input.maxMembers, description: input.description,
          tags: input.tags || [], genderFilter: input.genderFilter, ageMin: input.ageMin, ageMax: input.ageMax,
          creatorId,
        },
      });
      await tx.groupMember.create({ data: { groupId: group.id, userId: creatorId, role: "CREATOR", status: "ACCEPTED" } });
      await tx.conversation.create({ data: { groupId: group.id } });
      return group;
    });
  };
 
  findByDestination = async (destinationId: string) => {
    return await prisma.groupTrip.findMany({
      where: { destinationId, status: { in: ["OPEN", "FULL"] } },
      include: {
        destination: { select: { name: true, emoji: true, slug: true } },
        members: { where: { status: "ACCEPTED" }, include: { user: { select: { id: true, fullName: true, profilePhotoUrl: true } } } },
        _count: { select: { members: { where: { status: "ACCEPTED" } } } },
        conversation: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };
 
  findById = async (groupId: string) => {
    return await prisma.groupTrip.findUnique({
      where: { id: groupId },
      include: {
        destination: true,
        members: { include: { user: { select: { id: true, fullName: true, age: true, gender: true, city: true, travelStyle: true, profilePhotoUrl: true } } } },
        conversation: { select: { id: true } },
        _count: { select: { members: { where: { status: "ACCEPTED" } } } },
      },
    });
  };
 
  joinRequest = async (groupId: string, userId: string) => {
    return await prisma.groupMember.create({ data: { groupId, userId, status: "PENDING" } });
  };
 
  acceptMember = async (groupId: string, userId: string) => {
    return await prisma.groupMember.update({ where: { groupId_userId: { groupId, userId } }, data: { status: "ACCEPTED" } });
  };
 
  rejectMember = async (groupId: string, userId: string) => {
    return await prisma.groupMember.update({ where: { groupId_userId: { groupId, userId } }, data: { status: "REJECTED" } });
  };
 
  getMyGroups = async (userId: string) => {
    return await prisma.groupTrip.findMany({
      where: { members: { some: { userId, status: "ACCEPTED" } } },
      include: {
        destination: { select: { name: true, emoji: true, slug: true } },
        members: { where: { status: "ACCEPTED" }, include: { user: { select: { id: true, fullName: true, profilePhotoUrl: true } } } },
        conversation: { select: { id: true, lastMessage: true, lastMessageAt: true } },
        _count: { select: { members: { where: { status: "ACCEPTED" } } } },
      },
      orderBy: { startDate: "asc" },
    });
  };
}