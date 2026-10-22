"use server";

import { redirect } from "next/navigation";
import { clearSellerSession } from "@/lib/auth";

export async function sellerLogoutAction() {
  clearSellerSession();
  redirect("/vendeur-connexion");
}
