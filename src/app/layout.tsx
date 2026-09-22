import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { getSettings } from "@/lib/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caisse Familiale",
  description: "Gérer les dépenses, recettes et prêts de la maison",
};

// Every page reads live data straight from SQLite; never serve a stale
// prerendered shell for a money-tracking app.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  const dataTheme = settings.theme === "system" ? undefined : settings.theme;

  return (
    <html
      lang="fr"
      data-theme={dataTheme}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {settings.theme === "system" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme','dark');`,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur px-4 py-3 dark:bg-black/90 dark:border-white/10">
          <h1 className="text-lg font-semibold">
            💰 {settings.household_name}
          </h1>
        </header>
        <main className="flex-1 mx-auto w-full max-w-xl px-4 pb-24 pt-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
