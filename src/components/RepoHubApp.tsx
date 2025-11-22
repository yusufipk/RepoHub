"use client";

import { useState } from "react";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { UnifiedPackageManager } from "./UnifiedPackageManager";
import { ScriptPreview } from "@/components/ScriptPreview";
import { generateScript } from "@/lib/scriptGenerator";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Platform,
  Package,
  SelectedPackage,
  FilterOptions,
  GeneratedScript,
} from "@/types";

function RepoHubAppContent({
  cryptomusEnabled,
}: {
  cryptomusEnabled: boolean;
}) {
  const { t, locale } = useLocale();
  const [generatedScript, setGeneratedScript] =
    useState<GeneratedScript | null>(null);

  const handleGenerateScript = (
    selectedPackages: SelectedPackage[],
    selectedPlatform: Platform | null
  ) => {
    if (selectedPlatform && selectedPackages.length > 0) {
      const script = generateScript(selectedPackages, selectedPlatform);
      setGeneratedScript(script);
    }
  };

  const handleCloseScriptPreview = () => {
    setGeneratedScript(null);
  };

  return (
    <div
      key={locale}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20"
    >
      <Navbar cryptomusEnabled={cryptomusEnabled} />
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        {/* Unified Package Manager */}
        <UnifiedPackageManager onGenerateScript={handleGenerateScript} />

        {/* Script Preview Modal */}
        {generatedScript && (
          <ScriptPreview
            generatedScript={generatedScript}
            selectedPackages={generatedScript.packages}
            selectedPlatform={generatedScript.platform as any}
            onClose={handleCloseScriptPreview}
          />
        )}
      </div>
    </div>
  );
}

export function RepoHubApp({
  cryptomusEnabled,
}: {
  cryptomusEnabled: boolean;
}) {
  return (
    <LocaleProvider>
      <RepoHubAppContent cryptomusEnabled={cryptomusEnabled} />
    </LocaleProvider>
  );
}
