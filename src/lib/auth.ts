import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "elitetech_admin_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(payload: { id: string; email: string; name: string; role: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { id: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}

// ---------- Session vendeur (Programme Vendeur) ----------

const SELLER_COOKIE_NAME = "elitetech_seller_session";

export async function createSellerSession(payload: { id: string; email: string; name: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  cookies().set(SELLER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSellerSession() {
  const token = cookies().get(SELLER_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}

export function clearSellerSession() {
  cookies().delete(SELLER_COOKIE_NAME);
}
