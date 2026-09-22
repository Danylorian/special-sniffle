import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useSettings } from "../lib/SettingsContext";
import { useAndroidBackButton } from "../hooks/useAndroidBackButton";

export default function Layout() {
  const { settings } = useSettings();
  useAndroidBackButton();

  return (
    <div className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur px-4 py-3 dark:bg-black/90 dark:border-white/10">
        <h1 className="text-lg font-semibold">
          💰 {settings?.household_name ?? "Ma caisse"}
        </h1>
      </header>
      <main className="flex-1 mx-auto w-full max-w-xl px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
