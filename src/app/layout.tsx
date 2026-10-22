import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "EliteTech | Électronique, Téléphonie & Informatique à Hammamet",
  description:
    "EliteTech - Avenue Taieb Azabi, 8050 Hammamet. Vente de smartphones, ordinateurs, accessoires et matériel informatique. Commande en ligne, paiement à la livraison.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
