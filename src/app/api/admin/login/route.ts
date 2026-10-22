import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  await createAdminSession({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });

  return NextResponse.json({ ok: true });
}
