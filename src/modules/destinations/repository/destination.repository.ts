import { prisma } from "../../../config/prisma_client.ts";
import type { CreateDestinationInput } from "../schemas/destination.schema.ts";

export class DestinationRepository {

  findAll = async () => {
    return await prisma.destination.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { trips: true } },
      },
      orderBy: { name: "asc" },
    });
  };

  findBySlug = async (slug: string) => {
    return await prisma.destination.findUnique({
      where: { slug },
      include: {
        trips: {
          where: { status: "PLANNED" },
          include: {
            user: {
              select: {
                id: true, fullName: true, age: true, gender: true,
                city: true, travelStyle: true, profilePhotoUrl: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
        },
        _count: { select: { trips: true } },
      },
    });
  };

  create = async (input: CreateDestinationInput) => {
    return await prisma.destination.create({ data: input });
  };

  createMany = async (inputs: CreateDestinationInput[]) => {
    return await prisma.destination.createMany({
      data: inputs,
      skipDuplicates: true,
    });
  };

  search = async (query: string) => {
    return await prisma.destination.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { state: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { _count: { select: { trips: true } } },
    });
  };
}