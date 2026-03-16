import { TripRepository } from "../repository/trip.repository.ts";
import type { CreateTripInput, UpdateTripInput } from "../schemas/trip.schema.ts";

export class TripService {
  private repository = new TripRepository();

  create = async (userId: string, input: CreateTripInput) => {
    // Validate dates
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (end <= start) {
      throw new Error("End date must be after start date");
    }

    if (start < new Date()) {
      throw new Error("Start date cannot be in the past");
    }

    return await this.repository.create(userId, input);
  };

  getMyTrips = async (userId: string) => {
    const trips = await this.repository.findByUserId(userId);

    // Split into upcoming and past
    const now = new Date();
    const upcoming = trips.filter((t:any) => new Date(t.endDate) >= now && t.status !== "CANCELLED");
    const past = trips.filter((t:any) => new Date(t.endDate) < now || t.status === "COMPLETED");
    const cancelled = trips.filter((t:any) => t.status === "CANCELLED");

    return { upcoming, past, cancelled };
  };

  getById = async (tripId: string) => {
    const trip = await this.repository.findById(tripId);
    if (!trip) throw new Error("Trip not found");
    return trip;
  };

  update = async (tripId: string, userId: string, input: UpdateTripInput) => {
    const trip = await this.repository.findById(tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== userId) throw new Error("Not authorized");
    return await this.repository.update(tripId, input);
  };

  delete = async (tripId: string, userId: string) => {
    const trip = await this.repository.findById(tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== userId) throw new Error("Not authorized");
    return await this.repository.delete(tripId);
  };

  // Core feature: find travelers going to same place on same dates
  findTravelers = async (tripId: string, userId: string) => {
    const trip = await this.repository.findById(tripId);
    if (!trip) throw new Error("Trip not found");

    const overlapping = await this.repository.findOverlappingTrips(
      trip.destinationId,
      trip.startDate,
      trip.endDate,
      userId,
    );

    return overlapping.map((t:any) => ({
      tripId: t.id,
      startDate: t.startDate,
      endDate: t.endDate,
      budget: t.budget,
      destination: t.destination,
      user: t.user,
    }));
  };
}