import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RepairSchema = z.object({
  deviceModel: z.string().min(2),
  issueTypeId: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = RepairSchema.parse(await req.json());

    const issueType = await prisma.repairIssueType.findUnique({ where: { id: body.issueTypeId } });
    if (!issueType) {
      return NextResponse.json({ error: "Type de panne introuvable." }, { status: 400 });
    }

    const request = await prisma.repairRequest.create({
      data: {
        deviceModel: body.deviceModel,
        issueTypeId: issueType.id,
        issueLabel: issueType.name,
        estimatedMin: issueType.minPrice,
        estimatedMax: issueType.maxPrice,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ requestId: request.id });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Formulaire invalide, vérifiez les champs." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur, merci de réessayer." }, { status: 500 });
  }
}
