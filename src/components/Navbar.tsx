"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { SupportModal } from "@/components/SupportModal";
import { Globe, Heart, Github } from "lucide-react";
import Image from "next/image";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export interface NavbarProps {
  cryptomusEnabled: boolean;
}

export function Navbar({ cryptomusEnabled }: NavbarProps) {
  const { locale, toggleLocale, t } = useLocale();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 pointer-events-auto transition-all duration-300 ${
        isScrolled 
          ? 'mt-4' 
          : 'mt-0'
      }`}>
        <div className={`mx-auto flex h-14 items-center justify-between transition-all duration-300 ${
          isScrolled
            ? 'max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl rounded-full border border-border/40 bg-background/80 backdrop-blur-md shadow-lg px-4 sm:px-6'
            : 'container'
        }`}>
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

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  );
}
