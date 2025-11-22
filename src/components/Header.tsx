"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { SupportModal } from "@/components/SupportModal";
import { Globe, Heart, Github } from "lucide-react";
import Image from "next/image";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export interface HeaderProps {
  cryptomusEnabled: boolean;
}

export function Header({ cryptomusEnabled }: HeaderProps) {
  const { locale, toggleLocale, t } = useLocale();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  return (
    <>
      {/* Full Screen Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 border-b border-border/40 pointer-events-auto">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.png"
                  alt="RepoHub Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Support Button - Only show when Cryptomus is enabled */}
              {cryptomusEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Heart className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">
                    {t("support.title")}
                  </span>
                </Button>
              )}

              {/* GitHub Link */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a
                  href="https://github.com/yusufipk/RepoHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">GitHub</span>
                </a>
              </Button>

              {/* Theme Toggle */}
              <AnimatedThemeToggler />

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className="w-full justify-start"
              >
                <Globe className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">
                  {locale === "tr" ? "TR" : "EN"}
                </span>
              </Button>
            </div>
          </div>
        </div>

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

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  );
}
