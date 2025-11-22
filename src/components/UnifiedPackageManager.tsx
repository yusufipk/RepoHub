"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Monitor,
  Terminal,
  Package as PackageIcon,
  X,
  Download,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Package, Platform, SelectedPackage } from "@/types";
import { apiClient } from "@/lib/api/client";
import { useLocale } from "@/contexts/LocaleContext";
import { platformIconSlugs } from "@/data/mockData";

interface UnifiedPackageManagerProps {
  onGenerateScript: (
    selectedPackages: SelectedPackage[],
    selectedPlatform: Platform | null
  ) => void;
}

export function UnifiedPackageManager({
  onGenerateScript,
}: UnifiedPackageManagerProps) {
  const { t } = useLocale();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [repositoryFilter, setRepositoryFilter] = useState<string>("");
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showPackageSkeleton, setShowPackageSkeleton] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const iconBase = (slug: string) =>
    `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

  const isDebianUbuntu = useMemo(() => {
    const id = selectedPlatform?.id || "";
    return id === "debian" || id === "ubuntu";
  }, [selectedPlatform]);

  const isArch = useMemo(
    () => (selectedPlatform?.id || "") === "arch",
    [selectedPlatform]
  );

  // Load platforms
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const platformsData = await apiClient.getPlatforms();
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Failed to load platforms:", error);
        const { platforms: mockPlatforms } = await import("@/data/mockData");
        setPlatforms(mockPlatforms);
      } finally {
        // Wait 300ms before starting fade out
        setTimeout(() => {
          setShowSkeleton(false);
          // Wait for fade animation to complete
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }, 300);
      }
    };

    loadPlatforms();
  }, []);

  // Load packages when platform changes
  useEffect(() => {
    const loadPackages = async () => {
      if (!selectedPlatform) {
        setPackages([]);
        return;
      }

      setLoading(true);
      setShowPackageSkeleton(true);
      setPackages([]);
      setHasMore(true);

      try {
        const params: any = {
          platform_id: selectedPlatform.id,
          limit: 50,
          offset: 0,
        };

        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (isDebianUbuntu && typeFilter && typeFilter !== "all") {
          params.type = typeFilter as "gui" | "cli";
        }
        if (isArch && repositoryFilter && repositoryFilter !== "all") {
          params.repository = repositoryFilter as "official" | "aur";
        }

        const result = await apiClient.getPackages(params);
        setPackages(result.packages);
        setTotalCount(result.total);
        setHasMore(result.packages.length < result.total);
      } catch (error) {
        console.error("Failed to load packages:", error);
        setPackages([]);
      } finally {
        // Wait 300ms before starting fade out
        setTimeout(() => {
          setShowPackageSkeleton(false);
          // Wait for fade animation to complete
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }, 300);
      }
    };

    loadPackages();
  }, [selectedPlatform, typeFilter, repositoryFilter, isDebianUbuntu, isArch]);

  // Debounced search
  useEffect(() => {
    if (!selectedPlatform) return;

    const timeoutId = setTimeout(() => {
      const loadPackages = async () => {
        try {
          const params: any = {
            platform_id: selectedPlatform.id,
            limit: 50,
            offset: 0,
          };

          if (searchQuery && searchQuery.trim()) {
            params.search = searchQuery.trim();
          }

          if (isDebianUbuntu && typeFilter && typeFilter !== "all") {
            params.type = typeFilter as "gui" | "cli";
          }
          if (isArch && repositoryFilter && repositoryFilter !== "all") {
            params.repository = repositoryFilter as "official" | "aur";
          }

          const result = await apiClient.getPackages(params);
          setPackages(result.packages);
          setTotalCount(result.total);
          setHasMore(result.packages.length < result.total);
        } catch (error) {
          console.error("Failed to load packages:", error);
        }
      };

      loadPackages();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    isDebianUbuntu,
    typeFilter,
    isArch,
    repositoryFilter,
    selectedPlatform,
  ]);

  // Auto-show selected panel when packages are selected
  useEffect(() => {
    if (selectedPackages.length > 0) {
      setShowSelectedPanel(true);
    }
  }, [selectedPackages.length]);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setSelectedPackages([]);
    setSearchQuery("");
    setTypeFilter("");
    setRepositoryFilter("");
  };

  const handlePackageToggle = (pkg: Package) => {
    setSelectedPackages((prev) => {
      const exists = prev.some((p) => p.id === pkg.id);
      if (exists) {
        return prev.filter((p) => p.id !== pkg.id);
      } else {
        return [...prev, { ...pkg, selectedAt: new Date().toISOString() }];
      }
    });
  };

  const handlePackageRemove = (pkgId: string) => {
    setSelectedPackages((prev) => prev.filter((p) => p.id !== pkgId));
  };

  const handleClearAll = () => {
    setSelectedPackages([]);
  };

  const loadMore = async () => {
    if (!selectedPlatform || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const params: any = {
        platform_id: selectedPlatform.id,
        limit: 50,
        offset: packages.length,
      };

      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (isDebianUbuntu && typeFilter && typeFilter !== "all") {
        params.type = typeFilter as "gui" | "cli";
      }
      if (isArch && repositoryFilter && repositoryFilter !== "all") {
        params.repository = repositoryFilter as "official" | "aur";
      }

      const result = await apiClient.getPackages(params);
      setPackages((prev) => [...prev, ...result.packages]);
      setHasMore(packages.length + result.packages.length < result.total);
    } catch (error) {
      console.error("Failed to load more packages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const isPackageSelected = (pkg: Package) => {
    return selectedPackages.some((selected) => selected.id === pkg.id);
  };

  const getPackageIcon = (type: string) => {
    return type === "gui" ? (
      <Monitor className="h-4 w-4" />
    ) : (
      <Terminal className="h-4 w-4" />
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="flex h-[600px]">
          {/* Left Panel - Distro Icons */}
          <div className="w-20 bg-secondary/30 border-r border-border flex flex-col items-center py-4 space-y-2 overflow-y-auto">
            {loading && platforms.length === 0 ? (
              // Loading skeleton
              <div
                className={`transition-opacity duration-300 ${
                  showSkeleton ? "opacity-100" : "opacity-0"
                }`}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-lg bg-muted/50 animate-pulse mb-2"
                  />
                ))}
              </div>
            ) : (
              platforms.map((platform) => (
                <Tooltip key={platform.id} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`group relative w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        selectedPlatform?.id === platform.id
                          ? "border-primary bg-primary/10 scale-110"
                          : "border-border/50 hover:border-primary/40 hover:bg-accent/50"
                      }`}
                      onClick={() => handlePlatformSelect(platform)}
                      aria-pressed={selectedPlatform?.id === platform.id}
                      aria-label={`Select ${platform.name}`}
                    >
                      <div
                        className={`h-6 w-6 transition-all duration-200 ${
                          selectedPlatform?.id === platform.id
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                        style={
                          {
                            WebkitMaskImage: `url(${iconBase(
                              platformIconSlugs[platform.id] ||
                                platform.icon ||
                                "linux"
                            )})`,
                            maskImage: `url(${iconBase(
                              platformIconSlugs[platform.id] ||
                                platform.icon ||
                                "linux"
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
                      {selectedPlatform?.id === platform.id && (
                        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full border border-background" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {platform.name}
                  </TooltipContent>
                </Tooltip>
              ))
            )}
          </div>

          {/* Middle Panel - Available Packages */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              showSelectedPanel ? "max-w-[60%]" : "max-w-full"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {selectedPlatform
                      ? t("packages.title")
                      : t("platform.select")}
                  </h2>
                  {selectedPlatform && (
                    <span className="text-sm text-muted-foreground">
                      ({packages.length} / {totalCount})
                    </span>
                  )}
                </div>
              </div>

              {selectedPlatform && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t("packages.search")}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Type Filter (Debian/Ubuntu only) */}
                  {isDebianUbuntu && (
                    <Select
                      value={typeFilter || "all"}
                      onValueChange={(value) =>
                        setTypeFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32 text-sm">
                        <SelectValue placeholder={t("packages.filters.type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("packages.filters.all_types")}</SelectItem>
                        <SelectItem value="gui">{t("packages.filters.gui")}</SelectItem>
                        <SelectItem value="cli">{t("packages.filters.cli")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Repository Filter (Arch only) */}
                  {isArch && (
                    <Select
                      value={repositoryFilter || "all"}
                      onValueChange={(value) =>
                        setRepositoryFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32 text-sm">
                        <SelectValue placeholder={t("packages.filters.repository")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("packages.filters.all")}</SelectItem>
                        <SelectItem value="official">{t("packages.filters.official")}</SelectItem>
                        <SelectItem value="aur">{t("packages.filters.aur")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            {/* Package List */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedPlatform ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <PackageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("platform.description")}</p>
                  </div>
                </div>
              ) : loading ? (
                <div
                  className={`space-y-2 transition-opacity duration-300 ${
                    showPackageSkeleton ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                    >
                      <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                        <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <PackageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("packages.no_packages")}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isPackageSelected(pkg)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:bg-secondary/50 hover:border-primary/30"
                      }`}
                      onClick={() => handlePackageToggle(pkg)}
                    >
                      <Checkbox
                        checked={isPackageSelected(pkg)}
                        onCheckedChange={() => handlePackageToggle(pkg)}
                      />
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <div className="mt-0.5">
                          {isDebianUbuntu ? (
                            getPackageIcon(pkg.type || "cli")
                          ) : (
                            <PackageIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm truncate">
                              {pkg.name}
                            </h4>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                              {pkg.version}
                            </span>
                            {pkg.repository === "aur" && (
                              <span className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">
                                {t("packages.filters.aur")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {pkg.description || t("packages.no_description")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                            {t("packages.loading")}
                          </>
                        ) : (
                          t("packages.load_more", {
                            count: Math.min(50, totalCount - packages.length).toString(),
                          })
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Selected Packages */}
          <div
            className={`transition-all duration-300 border-l border-border bg-secondary/20 ${
              showSelectedPanel && selectedPackages.length > 0
                ? "w-80 opacity-100"
                : "w-0 opacity-0 overflow-hidden"
            }`}
          >
            {showSelectedPanel && selectedPackages.length > 0 && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {t("selection.title")} ({selectedPackages.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowSelectedPanel(false)}
                      className="p-1 hover:bg-secondary rounded-md transition-colors"
                      aria-label="Close panel"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="flex-1 text-xs"
                    >
                      {t("selection.clear_all")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        onGenerateScript(selectedPackages, selectedPlatform)
                      }
                      className="flex-1 text-xs"
                      disabled={
                        !selectedPlatform || selectedPackages.length === 0
                      }
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {t("selection.generate_script")}
                    </Button>
                  </div>
                </div>

                {/* Selected Package List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {selectedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-start justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm truncate">
                            {pkg.name}
                          </h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {pkg.version}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {pkg.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePackageRemove(pkg.id)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggle button when panel is hidden but there are selections */}
          {!showSelectedPanel && selectedPackages.length > 0 && (
            <button
              onClick={() => setShowSelectedPanel(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-l-lg shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Show selected packages"
            >
              <div className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {selectedPackages.length}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
