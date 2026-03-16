import { prisma } from "../../../config/prisma_client.ts";
import type { CreateTripInput, UpdateTripInput } from "../schemas/trip.schema.ts";

export class TripRepository {

  create = async (userId: string, input: CreateTripInput) => {
    return await prisma.trip.create({
      data: {
        userId,
        destinationId: input.destinationId,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: input.budget,
        notes: input.notes,
      },
      include: {
        destination: { select: { name: true, slug: true, emoji: true } },
      },
    });
  };

  findByUserId = async (userId: string) => {
    return await prisma.trip.findMany({
      where: { userId },
      include: {
        destination: { select: { name: true, slug: true, emoji: true } },
      },
      orderBy: { startDate: "asc" },
    });
  };

  findById = async (tripId: string) => {
    return await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        destination: { select: { name: true, slug: true, emoji: true } },
        user: {
          select: {
            id: true, fullName: true, age: true, gender: true,
            city: true, travelStyle: true, profilePhotoUrl: true,
          },
        },
      },
    });
  };

  update = async (tripId: string, input: UpdateTripInput) => {
    return await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(input.startDate && { startDate: new Date(input.startDate) }),
        ...(input.endDate && { endDate: new Date(input.endDate) }),
        ...(input.budget && { budget: input.budget }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status && { status: input.status }),
      },
      include: {
        destination: { select: { name: true, slug: true, emoji: true } },
      },
    });
  };

  delete = async (tripId: string) => {
    return await prisma.trip.delete({ where: { id: tripId } });
  };

  // Find travelers going to same destination on overlapping dates
  findOverlappingTrips = async (
    destinationId: string,
    startDate: Date,
    endDate: Date,
    excludeUserId: string,
  ) => {
    return await prisma.trip.findMany({
      where: {
        destinationId,
        status: "PLANNED",
        userId: { not: excludeUserId },
        // Overlapping dates: their trip starts before mine ends AND their trip ends after mine starts
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        user: {
          select: {
            id: true, fullName: true, age: true, gender: true,
            city: true, travelStyle: true, profilePhotoUrl: true, bio: true,
          },
        },
        destination: { select: { name: true, emoji: true } },
      },
    });
  };
}