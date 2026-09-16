import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blitle | Premium Garmin App",
  description: "Unlock premium Blitle functionality on your Garmin device."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
