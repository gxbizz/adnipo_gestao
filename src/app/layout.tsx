import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADNIPO Itaquera",
  description: "Sistema responsivo para gestão de pessoas, grupos e escalas."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
