import type { ProfileSetupInput } from "../schemas/profile-setup.schema.ts";
import { prisma } from "../../../config/prisma_client.ts";
import { RewardsService } from "../../rewards/service/rewards.service.ts";

export class ProfileSetupService {
  private rewardsService = new RewardsService();

  execute = async (userId: string, input: ProfileSetupInput) => {

    // Check if profile was already completed (to avoid double bonus)
    const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { isProfileCompleted: true } });
    const wasAlreadyCompleted = existingUser?.isProfileCompleted === true;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gender: input.gender,
        age: input.age,
        city: input.city || null,
        travelStyle: input.travelStyle || null,
        bio: input.bio || null,
        isProfileCompleted: true,
        // Mindset fields
        schedule: input.schedule || undefined,
        socialEnergy: input.socialEnergy || undefined,
        planningStyle: input.planningStyle || undefined,
        energyLevel: input.energyLevel || undefined,
        values: input.values || undefined,
        interests: input.interests || undefined,
        travelPriority: input.travelPriority || undefined,
      },
    });

    // Initialize Trek Points with signup bonus (only on first profile completion)
    if (!wasAlreadyCompleted) {
      try {
        await this.rewardsService.initialize(userId);
      } catch (e) {
        console.error("Failed to initialize rewards for user:", userId, e);
        // Non-blocking — profile setup should succeed even if rewards fails
      }
    }

    return {
      userId: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      age: updatedUser.age,
      city: updatedUser.city,
      bio: updatedUser.bio,
      travelStyle: updatedUser.travelStyle,
      isProfileCompleted: updatedUser.isProfileCompleted,
      schedule: updatedUser.schedule,
      socialEnergy: updatedUser.socialEnergy,
      planningStyle: updatedUser.planningStyle,
      energyLevel: updatedUser.energyLevel,
      values: updatedUser.values,
      interests: updatedUser.interests,
      travelPriority: updatedUser.travelPriority,
    };
  };
}