import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../../generated/prisma/client.ts';

const connectionString = Deno.env.get("DATABASE_URL");

if(!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };