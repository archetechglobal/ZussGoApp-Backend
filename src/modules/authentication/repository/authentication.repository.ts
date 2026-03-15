import { prisma } from "../../../config/prisma_client.ts";

interface CreateUserInput {
  authUserId: string;
  fullName: string;
  email: string;
}

export class AuthenticationRepository {

  createUser = async (input: CreateUserInput) => {
    const user = await prisma.user.create({
      data: {
        authUserId: input.authUserId,
        fullName: input.fullName,
        email: input.email,
        isProfileCompleted: false,
      },
    });

    return user;
  };

  findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  };

  findUserByAuthId = async (authUserId: string) => {
    const user = await prisma.user.findUnique({
      where: { authUserId },
    });

    return user;
  };
}