"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-screen w-full flex flex-col">
      {/* Hero Content */}
      <div className="relative z-10 flex-1 container flex items-end justify-between pb-16 pt-24">
        <BackgroundRippleEffect cellSize={61} />

        {/* Left Bottom - Main Title and Description */}
        <div className="flex flex-col space-y-4 max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            {t("common.subtitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            {t("common.description")}
          </p>
        </div>

        {/* Right Bottom - RepoHub Branding and Status */}
        <div className="flex flex-col items-end space-y-2">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            RepoHub
          </h2>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {t("common.status")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
