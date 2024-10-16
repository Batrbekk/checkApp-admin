import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../globals.css";
import Navbar from "@/components/navbar";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Checkapp admin",
  description: "Generated by @batrbekk",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  // Проверяем наличие токена в куках
  const token = cookies().get("jwt-token");

  // Если токен не найден, перенаправляем на главную страницу
  if (!token) {
    redirect("/");
  }

  return (
    <html lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <Navbar />
    {children}
    </body>
    </html>
  );
}
