import { prisma } from "../../../config/prisma_client.ts";

export class UsersService {

  getOtherUsers = async (currentUserId: string) => {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isProfileCompleted: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        gender: true,
        age: true,
        city: true,
        travelStyle: true,
        bio: true,
        profilePhotoUrl: true,
      },
    });

    return users;
  };
}