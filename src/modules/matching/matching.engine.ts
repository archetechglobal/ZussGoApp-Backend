// src/modules/matching/matching.engine.ts
// ZussGo Matching Algorithm — Scores travelers on compatibility (0-100)

import { prisma } from "../../config/prisma_client.ts";

// ─── TYPES ───

interface TravelerProfile {
  userId: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  travelStyle: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  tripId: string;
  startDate: Date;
  endDate: Date;
  budget: string | null;
  averageRating: number;
  totalRatings: number;
}

interface MatchResult {
  traveler: TravelerProfile;
  score: number;
  breakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
  dateOverlap: number;      // max 40
  travelStyle: number;      // max 20
  budgetMatch: number;       // max 15
  ageProximity: number;      // max 10
  genderPreference: number;  // max 10
  ratingsBoost: number;      // max 5
  total: number;             // max 100
}

// ─── TRAVEL STYLE COMPATIBILITY MAP ───
// How well do different travel styles match? (0-1 scale)

const STYLE_COMPATIBILITY: Record<string, Record<string, number>> = {
  "Backpacker": {
    "Backpacker": 1.0,
    "Explorer": 0.85,
    "Adventure Seeker": 0.9,
    "Culture Enthusiast": 0.6,
    "Relaxation": 0.3,
    "Luxury": 0.1,
    "Foodie": 0.7,
    "Photography": 0.65,
    "Solo Wanderer": 0.75,
    "Party": 0.6,
  },
  "Explorer": {
    "Backpacker": 0.85,
    "Explorer": 1.0,
    "Adventure Seeker": 0.8,
    "Culture Enthusiast": 0.8,
    "Relaxation": 0.5,
    "Luxury": 0.4,
    "Foodie": 0.75,
    "Photography": 0.8,
    "Solo Wanderer": 0.7,
    "Party": 0.5,
  },
  "Adventure Seeker": {
    "Backpacker": 0.9,
    "Explorer": 0.8,
    "Adventure Seeker": 1.0,
    "Culture Enthusiast": 0.5,
    "Relaxation": 0.2,
    "Luxury": 0.3,
    "Foodie": 0.5,
    "Photography": 0.6,
    "Solo Wanderer": 0.65,
    "Party": 0.7,
  },
  "Culture Enthusiast": {
    "Backpacker": 0.6,
    "Explorer": 0.8,
    "Adventure Seeker": 0.5,
    "Culture Enthusiast": 1.0,
    "Relaxation": 0.65,
    "Luxury": 0.7,
    "Foodie": 0.85,
    "Photography": 0.9,
    "Solo Wanderer": 0.6,
    "Party": 0.3,
  },
  "Relaxation": {
    "Backpacker": 0.3,
    "Explorer": 0.5,
    "Adventure Seeker": 0.2,
    "Culture Enthusiast": 0.65,
    "Relaxation": 1.0,
    "Luxury": 0.85,
    "Foodie": 0.7,
    "Photography": 0.5,
    "Solo Wanderer": 0.6,
    "Party": 0.2,
  },
  "Luxury": {
    "Backpacker": 0.1,
    "Explorer": 0.4,
    "Adventure Seeker": 0.3,
    "Culture Enthusiast": 0.7,
    "Relaxation": 0.85,
    "Luxury": 1.0,
    "Foodie": 0.75,
    "Photography": 0.6,
    "Solo Wanderer": 0.3,
    "Party": 0.4,
  },
  "Foodie": {
    "Backpacker": 0.7,
    "Explorer": 0.75,
    "Adventure Seeker": 0.5,
    "Culture Enthusiast": 0.85,
    "Relaxation": 0.7,
    "Luxury": 0.75,
    "Foodie": 1.0,
    "Photography": 0.8,
    "Solo Wanderer": 0.55,
    "Party": 0.6,
  },
  "Photography": {
    "Backpacker": 0.65,
    "Explorer": 0.8,
    "Adventure Seeker": 0.6,
    "Culture Enthusiast": 0.9,
    "Relaxation": 0.5,
    "Luxury": 0.6,
    "Foodie": 0.8,
    "Photography": 1.0,
    "Solo Wanderer": 0.7,
    "Party": 0.35,
  },
  "Solo Wanderer": {
    "Backpacker": 0.75,
    "Explorer": 0.7,
    "Adventure Seeker": 0.65,
    "Culture Enthusiast": 0.6,
    "Relaxation": 0.6,
    "Luxury": 0.3,
    "Foodie": 0.55,
    "Photography": 0.7,
    "Solo Wanderer": 1.0,
    "Party": 0.3,
  },
  "Party": {
    "Backpacker": 0.6,
    "Explorer": 0.5,
    "Adventure Seeker": 0.7,
    "Culture Enthusiast": 0.3,
    "Relaxation": 0.2,
    "Luxury": 0.4,
    "Foodie": 0.6,
    "Photography": 0.35,
    "Solo Wanderer": 0.3,
    "Party": 1.0,
  },
};

// ─── BUDGET COMPATIBILITY ───

const BUDGET_ORDER = ["Budget", "Mid-range", "Luxury"];

function getBudgetCompatibility(budgetA: string | null, budgetB: string | null): number {
  if (!budgetA || !budgetB) return 0.5; // unknown = neutral

  const indexA = BUDGET_ORDER.indexOf(budgetA);
  const indexB = BUDGET_ORDER.indexOf(budgetB);

  if (indexA === -1 || indexB === -1) return 0.5;

  const diff = Math.abs(indexA - indexB);
  if (diff === 0) return 1.0;   // exact match
  if (diff === 1) return 0.5;   // one step apart
  return 0.1;                    // two steps apart (Budget vs Luxury)
}

// ─── SCORING FUNCTIONS ───

function scoreDateOverlap(
  myStart: Date, myEnd: Date,
  theirStart: Date, theirEnd: Date,
): number {
  const MAX = 40;

  // Calculate overlap days
  const overlapStart = new Date(Math.max(myStart.getTime(), theirStart.getTime()));
  const overlapEnd = new Date(Math.min(myEnd.getTime(), theirEnd.getTime()));
  const overlapDays = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));

  // My trip duration
  const myDuration = Math.max(1, (myEnd.getTime() - myStart.getTime()) / (1000 * 60 * 60 * 24));

  // Overlap percentage relative to my trip
  const overlapPercent = overlapDays / myDuration;

  // Non-linear scoring: reward higher overlap exponentially
  // 100% overlap = 40pts, 75% = 35pts, 50% = 25pts, 25% = 12pts
  const score = Math.pow(overlapPercent, 0.7) * MAX;

  return Math.round(Math.min(score, MAX) * 10) / 10;
}

function scoreTravelStyle(myStyle: string | null, theirStyle: string | null): number {
  const MAX = 20;

  if (!myStyle || !theirStyle) return MAX * 0.5; // unknown = 50%

  const compatibility = STYLE_COMPATIBILITY[myStyle]?.[theirStyle] ?? 0.5;

  return Math.round(compatibility * MAX * 10) / 10;
}

function scoreBudgetMatch(myBudget: string | null, theirBudget: string | null): number {
  const MAX = 15;
  const compatibility = getBudgetCompatibility(myBudget, theirBudget);
  return Math.round(compatibility * MAX * 10) / 10;
}

function scoreAgeProximity(myAge: number | null, theirAge: number | null): number {
  const MAX = 10;

  if (!myAge || !theirAge) return MAX * 0.5;

  const diff = Math.abs(myAge - theirAge);

  // 0-2 years = 100%, 3-5 = 80%, 6-8 = 50%, 9-12 = 25%, 13+ = 5%
  let score: number;
  if (diff <= 2) score = 1.0;
  else if (diff <= 5) score = 0.8;
  else if (diff <= 8) score = 0.5;
  else if (diff <= 12) score = 0.25;
  else score = 0.05;

  return Math.round(score * MAX * 10) / 10;
}

function scoreGenderPreference(
  myGender: string | null,
  theirGender: string | null,
  preferSameGender: boolean,
): number {
  const MAX = 10;

  if (!preferSameGender) return MAX; // no preference = full points

  if (!myGender || !theirGender) return MAX * 0.5;

  return myGender === theirGender ? MAX : MAX * 0.2;
}

function scoreRatings(averageRating: number, totalRatings: number): number {
  const MAX = 5;

  if (totalRatings === 0) return MAX * 0.5; // new user = neutral

  // Rating factor (1-5 scale normalized to 0-1)
  const ratingFactor = (averageRating - 1) / 4;

  // Volume factor — more ratings = more reliable (log scale, caps at 10 ratings)
  const volumeFactor = Math.min(1, Math.log10(totalRatings + 1) / Math.log10(11));

  // Combined: 70% rating quality, 30% volume confidence
  const combined = ratingFactor * 0.7 + volumeFactor * 0.3;

  return Math.round(combined * MAX * 10) / 10;
}

// ─── MAIN MATCHING ENGINE ───

export class MatchingEngine {

  // Find and score all compatible travelers for a given trip
  findMatches = async (
    userId: string,
    tripId: string,
    options?: {
      preferSameGender?: boolean;
      minScore?: number;
    },
  ): Promise<MatchResult[]> => {
    const preferSameGender = options?.preferSameGender ?? false;
    const minScore = options?.minScore ?? 30; // minimum 30/100 to show

    // Get my trip details
    const myTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: {
          select: { id: true, fullName: true, age: true, gender: true, city: true, travelStyle: true, bio: true, profilePhotoUrl: true },
        },
        destination: true,
      },
    });

    if (!myTrip) throw new Error("Trip not found");

    // Get all overlapping trips at the same destination (excluding myself)
    const overlappingTrips = await prisma.trip.findMany({
      where: {
        destinationId: myTrip.destinationId,
        status: "PLANNED",
        userId: { not: userId },
        startDate: { lte: myTrip.endDate },
        endDate: { gte: myTrip.startDate },
      },
      include: {
        user: {
          select: { id: true, fullName: true, age: true, gender: true, city: true, travelStyle: true, bio: true, profilePhotoUrl: true },
        },
      },
    });

    // Get blocked users (both directions)
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId },
          { blockedId: userId },
        ],
      },
    });
    const blockedUserIds = new Set(
      blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId)
    );

    // Get existing match requests (to avoid showing people I already sent to)
    const existingRequests = await prisma.matchRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });
    const requestedUserIds = new Set(
      existingRequests.map(r => r.senderId === userId ? r.receiverId : r.senderId)
    );

    // Score each traveler
    const results: MatchResult[] = [];

    for (const trip of overlappingTrips) {
      // Skip blocked users
      if (blockedUserIds.has(trip.userId)) continue;

      // Get their average rating
      const ratingAgg = await prisma.rating.aggregate({
        where: { ratedId: trip.userId },
        _avg: { score: true },
        _count: { score: true },
      });

      const avgRating = ratingAgg._avg.score ?? 0;
      const totalRatings = ratingAgg._count.score ?? 0;

      // Calculate each score component
      const dateOverlap = scoreDateOverlap(
        myTrip.startDate, myTrip.endDate,
        trip.startDate, trip.endDate,
      );

      const travelStyle = scoreTravelStyle(
        myTrip.user.travelStyle,
        trip.user.travelStyle,
      );

      const budgetMatch = scoreBudgetMatch(myTrip.budget, trip.budget);

      const ageProximity = scoreAgeProximity(
        myTrip.user.age,
        trip.user.age,
      );

      const genderPreference = scoreGenderPreference(
        myTrip.user.gender,
        trip.user.gender,
        preferSameGender,
      );

      const ratingsBoost = scoreRatings(avgRating, totalRatings);

      const total = Math.round(
        (dateOverlap + travelStyle + budgetMatch + ageProximity + genderPreference + ratingsBoost) * 10
      ) / 10;

      const breakdown: ScoreBreakdown = {
        dateOverlap,
        travelStyle,
        budgetMatch,
        ageProximity,
        genderPreference,
        ratingsBoost,
        total,
      };

      // Only include if above minimum score
      if (total >= minScore) {
        results.push({
          traveler: {
            userId: trip.user.id,
            fullName: trip.user.fullName,
            age: trip.user.age,
            gender: trip.user.gender,
            city: trip.user.city,
            travelStyle: trip.user.travelStyle,
            bio: trip.user.bio,
            profilePhotoUrl: trip.user.profilePhotoUrl,
            tripId: trip.id,
            startDate: trip.startDate,
            endDate: trip.endDate,
            budget: trip.budget,
            averageRating: Math.round(avgRating * 10) / 10,
            totalRatings,
          },
          score: total,
          breakdown,
        });
      }
    }

    // Sort by score (highest first), then by ratings as tiebreaker
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker: higher rated person first
      if (b.traveler.averageRating !== a.traveler.averageRating) {
        return b.traveler.averageRating - a.traveler.averageRating;
      }
      // Second tiebreaker: more date overlap first
      return b.breakdown.dateOverlap - a.breakdown.dateOverlap;
    });

    // Mark which travelers already have pending/sent requests
    return results.map(r => ({
      ...r,
      alreadyRequested: requestedUserIds.has(r.traveler.userId),
    }));
  };

  // Get match quality label
  static getMatchLabel(score: number): { label: string; emoji: string; color: string } {
    if (score >= 85) return { label: "Perfect Match", emoji: "🔥", color: "#00F5D4" };
    if (score >= 70) return { label: "Great Match", emoji: "✨", color: "#F59E0B" };
    if (score >= 55) return { label: "Good Match", emoji: "👍", color: "#38BDF8" };
    if (score >= 40) return { label: "Decent Match", emoji: "🤝", color: "#A78BFA" };
    return { label: "Possible Match", emoji: "🌱", color: "#78716C" };
  }
}