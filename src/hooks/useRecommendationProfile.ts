"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  UserCategory,
  ExperienceLevel,
} from "@/types/recommendations";

const STORAGE_KEY = "repohub_user_profile";

/**
 * Detect user's operating system from browser
 */
function detectOS(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();

  // Windows
  if (userAgent.indexOf("win") !== -1 || platform.indexOf("win") !== -1) {
    return "windows";
  }

  // macOS
  if (
    userAgent.indexOf("mac") !== -1 ||
    platform.indexOf("mac") !== -1 ||
    userAgent.indexOf("darwin") !== -1
  ) {
    return "macos";
  }

  // Linux distros
  if (userAgent.indexOf("linux") !== -1 || platform.indexOf("linux") !== -1) {
    // Try to detect specific distro from user agent (rare but possible)
    if (userAgent.indexOf("ubuntu") !== -1) {
      return "ubuntu";
    }
    if (userAgent.indexOf("fedora") !== -1) {
      return "fedora";
    }
    if (userAgent.indexOf("arch") !== -1) {
      return "arch";
    }
    if (userAgent.indexOf("debian") !== -1) {
      return "debian";
    }

    // Default to Ubuntu for generic Linux
    return "ubuntu";
  }

  return "unknown";
}

const CURRENT_PROFILE_VERSION = 1;

/**
 * Get default user profile
 */
function getDefaultProfile(): UserProfile {
  return {
    version: CURRENT_PROFILE_VERSION,
    categories: [],
    detectedOS: detectOS(),
    selectedOS: undefined,
    hasCompletedOnboarding: false,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Hook for managing user recommendation profile in localStorage
 */
export function useRecommendationProfile() {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;

        // Handle version migration
        if (!parsed.version || parsed.version < CURRENT_PROFILE_VERSION) {
          console.log(
            "Migrating profile from version",
            parsed.version || 0,
            "to",
            CURRENT_PROFILE_VERSION
          );
          // Add migration logic here when schema changes in the future
          parsed.version = CURRENT_PROFILE_VERSION;
        }

        // Update detectedOS if it changed
        const currentOS = detectOS();
        if (parsed.detectedOS !== currentOS) {
          parsed.detectedOS = currentOS;
        }

        setProfile(parsed);
        // Save migrated profile
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } else {
        // First time user - save default profile
        const defaultProfile = getDefaultProfile();
        setProfile(defaultProfile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile to localStorage
  const saveProfile = useCallback(
    (newProfile: Partial<UserProfile>) => {
      try {
        const updated: UserProfile = {
          ...profile,
          ...newProfile,
          version: CURRENT_PROFILE_VERSION,
          lastUpdated: new Date().toISOString(),
        };

        console.log("💾 Saving profile:", updated);

        setProfile(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        console.log("✅ Profile saved successfully to localStorage");

        return true;
      } catch (error) {
        console.error("❌ Error saving user profile:", error);
        return false;
      }
    },
    [profile]
  );

  // Update categories
  const updateCategories = useCallback(
    (categories: UserCategory[]) => {
      return saveProfile({ categories });
    },
    [saveProfile]
  );

  // Update selected OS (manual override)
  const updateSelectedOS = useCallback(
    (os: string) => {
      return saveProfile({ selectedOS: os });
    },
    [saveProfile]
  );



  // Mark onboarding as completed
  const completeOnboarding = useCallback(() => {
    return saveProfile({ hasCompletedOnboarding: true });
  }, [saveProfile]);

  // Reset profile
  const resetProfile = useCallback(() => {
    try {
      const defaultProfile = getDefaultProfile();
      setProfile(defaultProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
      return true;
    } catch (error) {
      console.error("Error resetting user profile:", error);
      return false;
    }
  }, []);

  // Get effective OS (selectedOS or detectedOS)
  const getEffectiveOS = useCallback((): string => {
    return profile.selectedOS || profile.detectedOS || "ubuntu";
  }, [profile]);

  // Check if profile is complete enough for recommendations
  const isProfileComplete = useCallback((): boolean => {
    return profile.categories.length > 0 && getEffectiveOS() !== "unknown";
  }, [profile, getEffectiveOS]);

  return {
    profile,
    isLoading,
    saveProfile,
    updateCategories,
    updateSelectedOS,
    completeOnboarding,
    resetProfile,
    getEffectiveOS,
    isProfileComplete,
    detectedOS: profile.detectedOS,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
  };
}
