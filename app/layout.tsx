import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Intel | Prediction Markets Intelligence",
  description: "Real-time prediction market analytics and intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
