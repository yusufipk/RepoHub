"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useLocale } from "@/contexts/LocaleContext";
import { Platform } from "@/types";

interface PlatformSelectorProps {
  selectedPlatform: Platform | null;
  onPlatformSelect: (platform: Platform) => void;
}

export function PlatformSelector({
  selectedPlatform,
  onPlatformSelect,
}: PlatformSelectorProps) {
  const { t } = useLocale();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const iconSlug: Record<string, string> = {
    debian: "debian",
    ubuntu: "ubuntu",
    fedora: "fedora",
    arch: "archlinux",
    windows: "windows",
    macos: "apple",
  };
  const iconBase = (slug: string) =>
    `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const platformsData = await apiClient.getPlatforms();
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Failed to load platforms:", error);
        // Fallback to mock data if API fails
        const { platforms: mockPlatforms } = await import("@/data/mockData");
        setPlatforms(mockPlatforms);
      } finally {
        setLoading(false);
      }
    };

    loadPlatforms();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t("platform.select")}</CardTitle>
          <CardDescription className="text-sm">
            {t("platform.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-28 sm:w-32 h-20 rounded-lg border border-border bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t("platform.select")}</CardTitle>
        <CardDescription className="text-sm">
          {t("platform.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap justify-center gap-3">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              className={`group relative w-48 h-20 px-3 py-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                ${
                  selectedPlatform?.id === platform.id
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/20 scale-[1.02]"
                    : "border-border/50 hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                }`}
              onClick={() => onPlatformSelect(platform)}
              aria-pressed={selectedPlatform?.id === platform.id}
              aria-label={`Select ${platform.name}`}
            >
              <div
                className={`h-7 w-7 transition-all duration-200 ${
                  selectedPlatform?.id === platform.id
                    ? "text-primary scale-110"
                    : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                }`}
                style={
                  {
                    WebkitMaskImage: `url(${iconBase(
                      iconSlug[platform.id] || "linux"
                    )})`,
                    maskImage: `url(${iconBase(
                      iconSlug[platform.id] || "linux"
                    )})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    backgroundColor: "currentColor",
                  } as React.CSSProperties
                }
              />
              <span
                className={`text-xs font-medium leading-tight truncate max-w-full transition-colors duration-200 ${
                  selectedPlatform?.id === platform.id
                    ? "text-primary"
                    : "text-foreground/80 group-hover:text-foreground"
                }`}
              >
                {platform.name}
              </span>
              {selectedPlatform?.id === platform.id && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
