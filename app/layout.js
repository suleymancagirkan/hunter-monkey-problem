import { Fredoka, Outfit } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-game",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata = {
  title: "Avcı & Maymun Fizik Simülasyonu 🎯🐒",
  description: "Fizik dersindeki klasik Avcı ve Maymun probleminin oyunlaştırılmış, etkileşimli 2D simülasyonu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${fredoka.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
