import { RewardsRepository } from "../repository/rewards.repository.ts";
import type { EarnPointsInput, RedeemPointsInput } from "../schemas/rewards.schema.ts";

// Point values for different actions
const POINT_VALUES: Record<string, number> = {
  SIGNUP_BONUS: 500,
  TRIP_COMPLETED: 100,
  COMPANION_MATCHED: 50,
  RATING_GIVEN: 25,
};

// Redemption costs
const REDEEM_COSTS: Record<string, { points: number; label: string }> = {
  CASHBACK_50: { points: 500, label: "₹50 Cashback" },
  PROFILE_BOOST: { points: 300, label: "Profile Boost 7d" },
  VERIFIED_BADGE: { points: 1000, label: "Verified Badge" },
  GROUP_JOIN: { points: 750, label: "Free Group Join" },
};

// Tier info
const TIERS = [
  { name: "Explorer", emoji: "🌱", min: 0, max: 499 },
  { name: "Wanderer", emoji: "🗺️", min: 500, max: 1999 },
  { name: "Nomad", emoji: "⛺", min: 2000, max: 4999 },
  { name: "Pathfinder", emoji: "🏔️", min: 5000, max: Infinity },
];

export class RewardsService {
  private repository = new RewardsRepository();

  // Get full rewards profile
  getProfile = async (userId: string) => {
    const tp = await this.repository.getOrCreate(userId);
    const currentTier = TIERS.find((t) => t.name === tp.tier) ?? TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

    return {
      balance: tp.balance,
      tier: tp.tier,
      tierEmoji: currentTier.emoji,
      cashbackValue: Math.floor(tp.balance / 10), // ₹1 per 10 TP
      nextTier: nextTier
        ? {
            name: nextTier.name,
            emoji: nextTier.emoji,
            pointsNeeded: nextTier.min - tp.balance,
          }
        : null,
      tiers: TIERS.map((t) => ({
        name: t.name,
        emoji: t.emoji,
        range: t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`,
        isActive: t.name === tp.tier,
      })),
      recentActivity: tp.ledger.map((l: any) => ({
        id: l.id,
        amount: l.amount,
        type: l.type,
        description: l.description,
        createdAt: l.createdAt,
        isEarn: l.amount > 0,
      })),
      offers: Object.entries(REDEEM_COSTS).map(([key, val]) => ({
        id: key,
        ...val,
        canAfford: tp.balance >= val.points,
      })),
    };
  };

  // Earn points
  earn = async (input: EarnPointsInput) => {
    return await this.repository.addPoints(
      input.userId,
      input.amount,
      input.type,
      input.description,
      input.referenceId,
    );
  };

  // Auto-earn for specific actions (called from other modules)
  earnForAction = async (
    userId: string,
    action: keyof typeof POINT_VALUES,
    referenceId?: string,
  ) => {
    const amount = POINT_VALUES[action];
    if (!amount) throw new Error(`Unknown action: ${action}`);

    const descriptions: Record<string, string> = {
      SIGNUP_BONUS: "Welcome to ZussGo! Signup bonus",
      TRIP_COMPLETED: "Trip completed! Great adventure",
      COMPANION_MATCHED: "New companion matched",
      RATING_GIVEN: "Thanks for rating your companion",
    };

    return await this.repository.addPoints(
      userId,
      amount,
      action,
      descriptions[action] ?? `Earned ${amount} TP`,
      referenceId,
    );
  };

  // Redeem points
  redeem = async (input: RedeemPointsInput) => {
    return await this.repository.spendPoints(
      input.userId,
      input.amount,
      input.type,
      input.description,
    );
  };

  // Get ledger history
  getHistory = async (userId: string, limit = 20, offset = 0) => {
    return await this.repository.getLedger(userId, limit, offset);
  };

  // Initialize for new user
  initialize = async (userId: string) => {
    return await this.repository.initializeForUser(userId);
  };

  // Get balance only
  getBalance = async (userId: string) => {
    return await this.repository.getBalance(userId);
  };
}