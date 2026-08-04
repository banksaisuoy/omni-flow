import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniFlow | God Mode E-Commerce",
  description: "AI-Powered Commerce System",
};

import AiAssistant from "@/components/features/AiAssistant";

import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    // DB connection might fail — render without session
    console.error("Auth failed (DB may be unreachable):", e);
  }
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar session={session} />
        {children}
        <AiAssistant />
      </body>
    </html>
  );
}
