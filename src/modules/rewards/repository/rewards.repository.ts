import { prisma } from "../../../config/prisma_client.ts";
// import { TrekPoints } from '../../../../generated/prisma/models/TrekPoints.ts';

// Tier thresholds
const TIERS = [
  { name: "Explorer", min: 0, max: 499 },
  { name: "Wanderer", min: 500, max: 1999 },
  { name: "Nomad", min: 2000, max: 4999 },
  { name: "Pathfinder", min: 5000, max: Infinity },
];

function calculateTier(balance: number): string {
  for (const tier of TIERS) {
    if (balance >= tier.min && balance <= tier.max) return tier.name;
  }
  return "Explorer";
}

export class RewardsRepository {

  // Get or create TrekPoints for a user
  getOrCreate = async (userId: string) => {
    let tp = await prisma.trekPoints.findUnique({
      where: { userId },
      include: {
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!tp) {
      tp = await prisma.trekPoints.create({
        data: { userId, balance: 0, tier: "Explorer" },
        include: {
          ledger: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });
    }

    return tp;
  };

  // Get balance only (lightweight)
  getBalance = async (userId: string) => {
    const tp = await prisma.trekPoints.findUnique({
      where: { userId },
      select: { balance: true, tier: true },
    });
    return tp ?? { balance: 0, tier: "Explorer" };
  };

  // Add points (earn)
  addPoints = async (
    userId: string,
    amount: number,
    type: string,
    description: string,
    referenceId?: string,
  ) => {
    // Ensure TrekPoints record exists
    let tp = await prisma.trekPoints.findUnique({ where: { userId } });
    if (!tp) {
      tp = await prisma.trekPoints.create({
        data: { userId, balance: 0, tier: "Explorer" },
      });
    }

    const newBalance = tp.balance + amount;
    const newTier = calculateTier(newBalance);

    // Update balance + create ledger entry in transaction
    const [updatedTp, ledgerEntry] = await prisma.$transaction([
      prisma.trekPoints.update({
        where: { userId },
        data: { balance: newBalance, tier: newTier },
      }),
      prisma.pointLedger.create({
        data: {
          trekPointsId: tp.id,
          amount,
          type,
          description,
          referenceId,
        },
      }),
    ]);

    return { trekPoints: updatedTp, ledgerEntry };
  };

  // Spend points (redeem)
  spendPoints = async (
    userId: string,
    amount: number,
    type: string,
    description: string,
  ) => {
    const tp = await prisma.trekPoints.findUnique({ where: { userId } });
    if (!tp) throw new Error("No trek points account found");
    if (tp.balance < amount) throw new Error("Insufficient points");

    const newBalance = tp.balance - amount;
    const newTier = calculateTier(newBalance);

    const [updatedTp, ledgerEntry] = await prisma.$transaction([
      prisma.trekPoints.update({
        where: { userId },
        data: { balance: newBalance, tier: newTier },
      }),
      prisma.pointLedger.create({
        data: {
          trekPointsId: tp.id,
          amount: -amount, // negative for spend
          type,
          description,
        },
      }),
    ]);

    return { trekPoints: updatedTp, ledgerEntry };
  };

  // Get ledger history (paginated)
  getLedger = async (userId: string, limit = 20, offset = 0) => {
    const tp = await prisma.trekPoints.findUnique({ where: { userId } });
    if (!tp) return [];

    return await prisma.pointLedger.findMany({
      where: { trekPointsId: tp.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  };

  // Initialize points for new user (signup bonus)
  initializeForUser = async (userId: string, signupBonus = 500) => {
    const existing = await prisma.trekPoints.findUnique({ where: { userId } });
    if (existing) return existing; // already initialized

    const tier = calculateTier(signupBonus);
    const tp = await prisma.trekPoints.create({
      data: { userId, balance: signupBonus, tier },
    });

    await prisma.pointLedger.create({
      data: {
        trekPointsId: tp.id,
        amount: signupBonus,
        type: "SIGNUP_BONUS",
        description: "Welcome to ZussGo! Here's your signup bonus.",
      },
    });

    return tp;
  };
}