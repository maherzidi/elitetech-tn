import { prisma } from "@/lib/prisma";
import RepairQuoteClient from "./RepairQuoteClient";

export const dynamic = "force-dynamic";

export default async function RepairPage() {
  const issueTypes = await prisma.repairIssueType.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const serialized = issueTypes.map((t) => ({
    id: t.id,
    name: t.name,
    nameAr: t.nameAr,
    minPrice: Number(t.minPrice),
    maxPrice: Number(t.maxPrice),
  }));

  return <RepairQuoteClient issueTypes={serialized} />;
}
