import { PackageService } from "./packageService";
import { Package } from "@/models/Package";
import {
  RecommendationRequest,
  RecommendedPackage,
  UserCategory,
  ExperienceLevel,
} from "@/types/recommendations";
import { getPackagesForPlatform } from "@/data/recommendationPresets";



export class RecommendationService {
  /**
   * Generate package recommendations based on user profile
   */
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendedPackage[]> {
    const { platform_id, categories, experienceLevel, limit = 20 } = request;

    // Step 1: Get preset package names for the user's categories and platform
    const presetPackageNames = getPackagesForPlatform(platform_id, categories);

    // Step 2: Fetch packages from database
    const packageCategoryMap = new Map<string, UserCategory>();

    // Fetch preset packages
    const presetPackages = await this.fetchPresetPackages(
      presetPackageNames,
      platform_id,
      categories,
      packageCategoryMap
    );

    // Step 3: Score and rank packages
    const scoredPackages = presetPackages.map((pkg) => {
      const matchedCategory = packageCategoryMap.get(pkg.id) || categories[0];
      return this.scorePackage(
        pkg,
        categories,
        platform_id,
        presetPackageNames,
        matchedCategory
      );
    });

    // Step 4: Sort by score and limit results
    scoredPackages.sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    );

    return scoredPackages.slice(0, limit);
  }

  /**
   * Fetch packages that match preset names
   */
  private static async fetchPresetPackages(
    packageNames: string[],
    platformId: string,
    categories: UserCategory[],
    categoryMap: Map<string, UserCategory>
  ): Promise<Package[]> {
    if (packageNames.length === 0) {
      return [];
    }

    try {
      const packages: Package[] = [];
      let categoryIndex = 0;

      // Search for each package name (case-insensitive)
      for (const name of packageNames) {
        const result = await PackageService.getMany({
          platform_id: platformId,
          search: name,
          limit: 5, // Get top 5 matches to handle variations
          sort_by: "popularity_score",
          sort_order: "desc",
        });

        // Find best match (case-insensitive, exact name preferred)
        const exactMatch = result.packages.find(
          (pkg) => pkg.name.toLowerCase() === name.toLowerCase()
        );

        if (exactMatch) {
          packages.push(exactMatch);
          // Distribute categories evenly
          categoryMap.set(exactMatch.id, categories[categoryIndex % categories.length]);
          categoryIndex++;
        } else if (result.packages.length > 0) {
          // If no exact match, take the first result (most popular match)
          packages.push(result.packages[0]);
          categoryMap.set(result.packages[0].id, categories[categoryIndex % categories.length]);
          categoryIndex++;
        }
      }

      return packages;
    } catch (error) {
      console.error("Error fetching preset packages:", error);
      return [];
    }
  }



  /**
   * Remove duplicate packages (by ID)
   */
  private static deduplicatePackages(packages: Package[]): Package[] {
    const seen = new Set<string>();
    return packages.filter((pkg) => {
      if (seen.has(pkg.id)) {
        return false;
      }
      seen.add(pkg.id);
      return true;
    });
  }

  /**
   * Score a package based on simplified factors (popularity & preset)
   */
  private static scorePackage(
    pkg: Package,
    categories: UserCategory[],
    platformId: string,
    presetPackageNames: string[],
    matchedCategory?: UserCategory
  ): RecommendedPackage {
    const isPresetMatch = presetPackageNames.includes(pkg.name);

    // Simplified score: just use popularity score (0-100)
    // Give a boost to preset packages so they appear first
    let finalScore = pkg.popularity_score || 0;

    if (isPresetMatch) {
      finalScore += 100; // Ensure presets are always on top
    }

    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || "No description available",
      version: pkg.version || "latest",
      category:
        typeof pkg.category === "string" ? pkg.category : pkg.category?.name,
      license:
        typeof pkg.license === "string" ? pkg.license : pkg.license?.name,
      type: pkg.type || "cli",
      platform: pkg.platform as any,
      platform_id: pkg.platform_id,
      repository: pkg.repository || "official",
      download_url: pkg.download_url,
      lastUpdated: pkg.last_updated ? pkg.last_updated.toString() : undefined,
      downloads: pkg.downloads_count,
      popularity: pkg.popularity_score,
      popularity_score: pkg.popularity_score,
      tags: pkg.tags,
      recommendationScore: finalScore,
      recommendationReason: "", // Removed as requested
      presetMatch: isPresetMatch,
      matchedCategory: matchedCategory,
    };
  }

  /**
   * Get quick start recommendations (top 5 most essential)
   */
  static async getQuickStartRecommendations(
    platformId: string,
    primaryCategory: UserCategory
  ): Promise<RecommendedPackage[]> {
    return this.generateRecommendations({
      platform_id: platformId,
      categories: [primaryCategory],
      limit: 5,
    });
  }

  /**
   * Get recommendations for multiple categories with balanced distribution
   */
  static async getBalancedRecommendations(
    platformId: string,
    categories: UserCategory[],
    totalLimit: number = 20
  ): Promise<RecommendedPackage[]> {
    const perCategory = Math.ceil(totalLimit / categories.length);
    const allRecommendations: RecommendedPackage[] = [];

    for (const category of categories) {
      const recommendations = await this.generateRecommendations({
        platform_id: platformId,
        categories: [category],
        limit: perCategory,
      });
      allRecommendations.push(...recommendations);
    }

    // Deduplicate by ID and re-sort
    const seen = new Set<string>();
    const deduplicated = allRecommendations.filter((pkg) => {
      if (seen.has(pkg.id)) {
        return false;
      }
      seen.add(pkg.id);
      return true;
    });

    deduplicated.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return deduplicated.slice(0, totalLimit);
  }
}
