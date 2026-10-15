import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-syne" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

export const metadata = {
  title: "Welcome Itzfizz",
  description: "Scroll-driven hero section animation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dm.variable} bg-[#dfe9f2] font-[family-name:var(--font-dm)] text-[#0e2a47] overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}