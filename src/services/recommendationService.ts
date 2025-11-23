import { Package } from "@/models/Package";
import {
  RecommendationRequest,
  RecommendedPackage,
  UserCategory,
} from "@/types/recommendations";
import { getPackagesWithCategories, getPresetDetails, getPresetIcon } from "@/data/recommendationPresets";

export class RecommendationService {
  /**
   * Generate package recommendations based on user profile
   */
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendedPackage[]> {
    const { platform_id, categories, limit = 20 } = request;

    // Step 1: Get preset package names for the user's categories and platform
    const presetPackagesInfo = getPackagesWithCategories(platform_id, categories);
    const presetPackageNames = presetPackagesInfo.map(p => p.name);

    // Step 2: Generate packages from presets (no DB query)
    const packageCategoryMap = new Map<string, UserCategory>();

    // Fetch preset packages
    const presetPackages = await this.fetchPresetPackages(
      presetPackagesInfo,
      platform_id,
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
   * optimized to use static data instead of DB queries
   */
  private static async fetchPresetPackages(
    packagesInfo: { name: string; category: UserCategory }[],
    platformId: string,
    categoryMap: Map<string, UserCategory>
  ): Promise<Package[]> {
    if (packagesInfo.length === 0) {
      return [];
    }

    const packages: Package[] = [];

    for (const { name, category } of packagesInfo) {
      // Get icon slug if available
      const iconSlug = getPresetIcon(name);
      
      // Create a mock package object to avoid database queries
      // This ensures instant loading for recommendations
      const mockPackage: Package = {
        id: `${platformId}:${name.toLowerCase()}`, 
        name: name,
        description: "", // Description removed as requested
        version: "latest",
        platform_id: platformId,
        type: "cli", 
        repository: "official",
        popularity_score: 100, 
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        downloads_count: 10000, 
        platform: {
            id: platformId,
            name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
            package_manager: "unknown" 
        },
        // We attach the icon slug to the tags temporarily or we can add a custom field if we extend the type
        // But simpler is to pass it through the system.
        // Actually, Package interface doesn't have icon. 
        // RecommendedPackage does (we added it).
        // So we need to handle this in scorePackage or casting.
      };

      // Hack: Store icon slug in tags so it survives until scorePackage
      if (iconSlug) {
        mockPackage.tags = [`icon:${iconSlug}`];
      }

      packages.push(mockPackage);
      categoryMap.set(mockPackage.id, category);
    }

    return packages;
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

    // Extract icon from tags if present
    let icon: string | undefined;
    if (pkg.tags) {
      const iconTag = pkg.tags.find(tag => tag.startsWith('icon:'));
      if (iconTag) {
        icon = iconTag.replace('icon:', '');
      }
    }

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
      icon: icon
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
