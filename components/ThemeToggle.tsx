"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const ThemeToggle = ({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;

    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  // before mount, show dark to match SSR
  const showSun = mounted && isDark;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle dark mode"
        className={cn(
          "flex size-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
          className,
        )}>
        {showSun ? (
          <Sun className="size-5 text-yellow-400" />
        ) : (
          <Moon className="size-5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={cn(
        "sidebar-link w-full justify-center xl:justify-start",
        className,
      )}>
      {showSun ? (
        <Sun className="size-6 shrink-0 text-yellow-400" />
      ) : (
        <Moon className="size-6 shrink-0 text-slate-600 dark:text-slate-300" />
      )}

      <span className="sidebar-label">{showSun ? "Light mode" : "Dark mode"}</span>
    </button>
  );
};

export default ThemeToggle;
