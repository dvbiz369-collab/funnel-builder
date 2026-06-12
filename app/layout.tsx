import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://funnelly.vercel.app"),
  title: "Funnelly — Mobile funnels in minutes",
  description:
    "Build beautiful mobile-first funnels free. Quiz steps, lead forms, tap-to-call. No account, no database — your funnel lives in the share link.",
  openGraph: {
    title: "Funnelly — Mobile funnels in minutes",
    description:
      "Build beautiful mobile-first funnels free. No account needed — your funnel lives in the share link.",
    url: "https://funnelly.vercel.app",
    siteName: "Funnelly",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Funnelly — Mobile funnels in minutes",
    description: "Free mobile-first funnel builder. No account, no database.",
  },
};

// Applies the saved (or OS-preferred) theme before first paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem("funnelly-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
