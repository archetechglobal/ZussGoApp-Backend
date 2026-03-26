import { GroupRepository } from "../repository/group.repository.ts";
import type { CreateGroupInput } from "../schemas/group.schema.ts";
 
export class GroupService {
  private repo = new GroupRepository();
 
  create = async (creatorId: string, input: CreateGroupInput) => {
    return await this.repo.create(creatorId, input);
  };
 
  getByDestination = async (destinationId: string) => {
    const groups = await this.repo.findByDestination(destinationId);
    return groups.map((g: any) => ({
      ...g, memberCount: g._count.members, isFull: g._count.members >= g.maxMembers,
    }));
  };
 
  getById = async (groupId: string) => {
    const g = await this.repo.findById(groupId);
    if (!g) throw new Error("Group not found");
    return { ...g, memberCount: g._count.members, isFull: g._count.members >= g.maxMembers };
  };
 
  join = async (groupId: string, userId: string) => {
    const g = await this.repo.findById(groupId);
    if (!g) throw new Error("Group not found");
    if (g._count.members >= g.maxMembers) throw new Error("Group is full");
    return await this.repo.joinRequest(groupId, userId);
  };
 
  acceptMember = async (groupId: string, userId: string, creatorId: string) => {
    const g = await this.repo.findById(groupId);
    if (!g) throw new Error("Group not found");
    if (g.creatorId !== creatorId) throw new Error("Only creator can accept members");
    return await this.repo.acceptMember(groupId, userId);
  };
 
  getMyGroups = async (userId: string) => {
    return await this.repo.getMyGroups(userId);
  };
}