import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import "./globals.css";

const biz_udpgothic = BIZ_UDPGothic({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-biz_udpgothic",
});

export const metadata: Metadata = {
  title: "Notly",
  description:
    "Simple, easy-to-use desktop application to get into the habit of writing notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${biz_udpgothic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
