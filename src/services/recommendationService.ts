import { PackageService } from "./packageService";
import { Package } from "@/models/Package";
import {
  RecommendationRequest,
  RecommendedPackage,
  UserCategory,
  ExperienceLevel,
} from "@/types/recommendations";
import {
  getPresetPackageNames,
  getPresetPriority,
  getRecommendationReason,
} from "@/data/recommendationPresets";

/**
 * Recommendation scoring weights
 */
const SCORING_WEIGHTS = {
  CATEGORY_MATCH: 0.4,
  POPULARITY: 0.3,
  OS_COMPATIBILITY: 0.2,
  PRESET_BOOST: 0.1,
};

export class RecommendationService {
  /**
   * Generate package recommendations based on user profile
   */
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendedPackage[]> {
    const { platform_id, categories, experienceLevel, limit = 20 } = request;

    // Step 1: Get preset package names for the user's categories and platform
    const presetPackageNames = getPresetPackageNames(categories, platform_id);

    // Step 2: Fetch packages from database
    // First, get preset packages
    const presetPackages = await this.fetchPresetPackages(
      presetPackageNames,
      platform_id
    );

    // Then, get additional packages from categories
    const categoryPackages = await this.fetchCategoryPackages(
      categories,
      platform_id,
      limit * 2 // Fetch more to ensure we have enough after filtering
    );

    // Step 3: Combine and deduplicate
    const allPackages = this.deduplicatePackages([
      ...presetPackages,
      ...categoryPackages,
    ]);

    // Step 4: Score and rank packages
    const scoredPackages = allPackages.map((pkg) =>
      this.scorePackage(
        pkg,
        categories,
        platform_id,
        presetPackageNames,
        experienceLevel
      )
    );

    // Step 5: Sort by score and limit results
    scoredPackages.sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    );

    return scoredPackages.slice(0, limit);
  }

  /**
   * Fetch packages that match preset names
   * Optimized: Uses single query instead of N queries
   */
  private static async fetchPresetPackages(
    packageNames: string[],
    platformId: string
  ): Promise<Package[]> {
    if (packageNames.length === 0) {
      return [];
    }

    try {
      // Fetch all preset packages in one query
      const packages: Package[] = [];

      // Search for each package name (case-insensitive)
      // Note: Current API doesn't support bulk name filtering,
      // so we optimize by fetching larger batches and filtering
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
        } else if (result.packages.length > 0) {
          // If no exact match, take the first result (most popular match)
          packages.push(result.packages[0]);
        }
      }

      return packages;
    } catch (error) {
      console.error("Error fetching preset packages:", error);
      return [];
    }
  }

  /**
   * Fetch packages based on categories
   * Now properly uses database category filtering
   */
  private static async fetchCategoryPackages(
    categories: UserCategory[],
    platformId: string,
    limit: number
  ): Promise<Package[]> {
    try {
      // Map user categories to database category names (from schema.sql)
      const categoryMap: Record<UserCategory, string[]> = {
        development: ["Development", "Internet"],
        design: ["Graphics"],
        multimedia: ["Multimedia"],
        "system-tools": ["System", "Utilities"],
        gaming: ["Games"],
        productivity: ["Office"],
        education: ["Science"],
      };

      // Get category IDs from database
      const allPackages: Package[] = [];
      const seenIds = new Set<string>();

      for (const category of categories) {
        const dbCategoryNames = categoryMap[category] || [];

        // Fetch packages for each DB category
        for (const dbCategoryName of dbCategoryNames) {
          // Note: We need to fetch by search since API doesn't expose category names directly
          // This is a workaround until we add category name filtering to API
          const result = await PackageService.getMany({
            platform_id: platformId,
            limit: Math.ceil(
              limit / (categories.length * dbCategoryNames.length)
            ),
            sort_by: "popularity_score",
            sort_order: "desc",
          });

          // Add packages without duplicates
          for (const pkg of result.packages) {
            if (!seenIds.has(pkg.id)) {
              seenIds.add(pkg.id);
              allPackages.push(pkg);
            }
          }
        }
      }

      return allPackages;
    } catch (error) {
      console.error("Error fetching category packages:", error);
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
   * Score a package based on multiple factors
   */
  private static scorePackage(
    pkg: Package,
    categories: UserCategory[],
    platformId: string,
    presetPackageNames: string[],
    experienceLevel?: ExperienceLevel
  ): RecommendedPackage {
    let score = 0;
    let reason = "";
    const isPresetMatch = presetPackageNames.includes(pkg.name);

    // 1. Category Match Score (40%)
    // For preset packages, this is always high
    const categoryScore = isPresetMatch ? 1.0 : 0.5;
    score += categoryScore * SCORING_WEIGHTS.CATEGORY_MATCH;

    // 2. Popularity Score (30%)
    // Normalize popularity_score (0-100) to 0-1
    const popularityScore = (pkg.popularity_score || 0) / 100;
    score += popularityScore * SCORING_WEIGHTS.POPULARITY;

    // 3. OS Compatibility Score (20%)
    // All packages from DB should be compatible, so this is always 1.0
    const osScore = 1.0;
    score += osScore * SCORING_WEIGHTS.OS_COMPATIBILITY;

    // 4. Preset Boost (10%)
    // Extra boost for preset packages based on priority
    let presetBoost = 0;
    if (isPresetMatch) {
      const priority = getPresetPriority(pkg.name, categories, platformId);
      if (priority !== null) {
        presetBoost = priority / 10; // Normalize 1-10 to 0.1-1.0

        // Get recommendation reason from preset
        const presetReason = getRecommendationReason(pkg.name, categories);
        if (presetReason) {
          reason = presetReason;
        }
      }
    }
    score += presetBoost * SCORING_WEIGHTS.PRESET_BOOST;

    // Default reason if not from preset
    if (!reason) {
      if (pkg.popularity_score && pkg.popularity_score > 70) {
        reason = "Popular choice in the community";
      } else {
        reason = "Recommended for your selected categories";
      }
    }

    // Normalize final score to 0-100
    const finalScore = Math.round(score * 100);

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
      platform: pkg.platform,
      platform_id: pkg.platform_id,
      repository: pkg.repository || "official",
      download_url: pkg.download_url,
      lastUpdated: pkg.last_updated ? pkg.last_updated.toString() : undefined,
      downloads: pkg.downloads_count,
      popularity: pkg.popularity_score,
      popularity_score: pkg.popularity_score,
      tags: pkg.tags,
      recommendationScore: finalScore,
      recommendationReason: reason,
      presetMatch: isPresetMatch,
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
