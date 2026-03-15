import type { ProfileSetupInput } from "../schemas/profile-setup.schema.ts";
import { prisma } from "../../../config/prisma_client.ts";

export class ProfileSetupService {

  execute = async (userId: string, input: ProfileSetupInput) => {

    // Update the user's profile in our database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gender: input.gender,
        age: input.age,
        city: input.city || null,
        travelStyle: input.travelStyle || null,
        bio: input.bio || null,
        isProfileCompleted: true,
      },
    });

    return {
      userId: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      age: updatedUser.age,
      city: updatedUser.city,
      travelStyle: updatedUser.travelStyle,
      isProfileCompleted: updatedUser.isProfileCompleted,
    };
  };
}