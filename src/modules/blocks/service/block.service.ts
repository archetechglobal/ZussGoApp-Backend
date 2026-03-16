import { BlockRepository } from "../repository/block.repository.ts";

export class BlockService {
  private repository = new BlockRepository();

  block = async (blockerId: string, blockedId: string, reason?: string) => {
    if (blockerId === blockedId) throw new Error("Cannot block yourself");

    const existing = await this.repository.findExisting(blockerId, blockedId);
    if (existing) throw new Error("User already blocked");

    return await this.repository.create(blockerId, blockedId, reason);
  };

  unblock = async (blockerId: string, blockedId: string) => {
    const existing = await this.repository.findExisting(blockerId, blockedId);
    if (!existing) throw new Error("User is not blocked");

    return await this.repository.delete(blockerId, blockedId);
  };

  getBlockedUsers = async (blockerId: string) => {
    return await this.repository.findByBlocker(blockerId);
  };

  isBlocked = async (userAId: string, userBId: string) => {
    return await this.repository.isBlocked(userAId, userBId);
  };
}