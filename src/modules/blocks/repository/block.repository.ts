import { prisma } from "../../../config/prisma_client.ts";

export class BlockRepository {

  create = async (blockerId: string, blockedId: string, reason?: string) => {
    return await prisma.block.create({
      data: { blockerId, blockedId, reason },
    });
  };

  findByBlocker = async (blockerId: string) => {
    return await prisma.block.findMany({
      where: { blockerId },
      include: {
        blocked: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  findExisting = async (blockerId: string, blockedId: string) => {
    return await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });
  };

  isBlocked = async (userAId: string, userBId: string) => {
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userAId, blockedId: userBId },
          { blockerId: userBId, blockedId: userAId },
        ],
      },
    });
    return !!block;
  };

  delete = async (blockerId: string, blockedId: string) => {
    return await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });
  };
}