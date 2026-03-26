import type { ProfileSetupInput } from "../schemas/profile-setup.schema.ts";
import { prisma } from "../../../config/prisma_client.ts";

export class ProfileSetupService {

  execute = async (userId: string, input: ProfileSetupInput) => {

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