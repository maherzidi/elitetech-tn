import { PrismaClient } from "@prisma/client";

// Evite de recreer une connexion Prisma a chaque hot-reload en dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
