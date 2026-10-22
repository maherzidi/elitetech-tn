import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSellerSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const seller = await prisma.seller.findUnique({ where: { email } });
  if (!seller) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, seller.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  await createSellerSession({ id: seller.id, email: seller.email, name: seller.name });

  return NextResponse.json({ ok: true, status: seller.status });
}
