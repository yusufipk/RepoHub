import { Package, Platform } from "./index";

/**
 * User category types for package recommendations
 */
export type UserCategory =
  | "development"
  | "design"
  | "multimedia"
  | "system-tools"
  | "gaming"
  | "productivity"
  | "education";

/**
 * User experience level
 */
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/**
 * User profile stored in localStorage
 */
export interface UserProfile {
  version: number; // Schema version for future migrations
  categories: UserCategory[];
  detectedOS?: string;
  selectedOS?: string; // Manual override
  experienceLevel?: ExperienceLevel;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Request payload for recommendation API
 */
export interface RecommendationRequest {
  platform_id: string;
  categories: UserCategory[];
  experienceLevel?: ExperienceLevel;
  limit?: number;
}

/**
 * Recommended package with score
 */
export interface RecommendedPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  category?: string;
  license?: string;
  type: "gui" | "cli";
  platform?: Platform;
  platform_id?: string;
  repository: "official" | "third-party" | "aur";
  download_url?: string;
  lastUpdated?: string;
  downloads?: number;
  popularity?: number;
  popularity_score?: number;
  tags?: string[];
  recommendationScore: number;
  recommendationReason: string;
  presetMatch?: boolean;
  matchedCategory?: UserCategory; // Which user category this package matched
  icon?: string;
}

/**
 * Preset package configuration
 */
export interface PackagePreset {
  packageName: string;
  platforms: string[]; // ['windows', 'macos', 'ubuntu', 'arch', 'fedora']
  priority: number; // 1-10, higher = more important
  reason: string; // Why this package is recommended
  experienceLevel?: ExperienceLevel[]; // Target experience levels
}

/**
 * Category preset configuration
 */
export interface CategoryPreset {
  category: UserCategory;
  packages: PackagePreset[];
  description: string;
  // Icon removed in favor of UI-side mapping
}

/**
 * Recommendation response
 */
export interface RecommendationResponse {
  recommendations: RecommendedPackage[];
  total: number;
  userProfile: {
    categories: UserCategory[];
    platform: string;
  };
}
