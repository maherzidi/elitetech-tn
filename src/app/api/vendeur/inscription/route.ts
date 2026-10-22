import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SignupSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = SignupSchema.parse(await req.json());

    const existing = await prisma.seller.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Un compte vendeur existe déjà avec cet email." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    await prisma.seller.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Formulaire invalide, vérifiez les champs." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur, merci de réessayer." }, { status: 500 });
  }
}
