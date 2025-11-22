import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/services/recommendationService";
import { RecommendationRequest } from "@/types/recommendations";

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();

    // Validate required fields
    if (!body.platform_id) {
      return NextResponse.json(
        { error: "platform_id is required" },
        { status: 400 }
      );
    }

    if (!body.categories || body.categories.length === 0) {
      return NextResponse.json(
        { error: "At least one category is required" },
        { status: 400 }
      );
    }

    // Validate platform_id
    const validPlatforms = [
      "windows",
      "macos",
      "ubuntu",
      "debian",
      "arch",
      "fedora",
    ];
    if (!validPlatforms.includes(body.platform_id)) {
      return NextResponse.json(
        {
          error: `Invalid platform_id. Must be one of: ${validPlatforms.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate categories
    const validCategories = [
      "development",
      "design",
      "multimedia",
      "system-tools",
      "gaming",
      "productivity",
      "education",
    ];
    const invalidCategories = body.categories.filter(
      (cat) => !validCategories.includes(cat)
    );
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid categories: ${invalidCategories.join(", ")}`,
          validCategories,
        },
        { status: 400 }
      );
    }

    // Validate and set limit with better error message
    if (body.limit !== undefined && (body.limit < 1 || body.limit > 50)) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }
    const limit =
      body.limit && body.limit > 0 && body.limit <= 50 ? body.limit : 20;

    // Generate recommendations
    const recommendations = await RecommendationService.generateRecommendations(
      {
        platform_id: body.platform_id,
        categories: body.categories,
        experienceLevel: body.experienceLevel,
        limit,
      }
    );

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
      userProfile: {
        categories: body.categories,
        platform: body.platform_id,
        experienceLevel: body.experienceLevel,
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("platform_id");
    const categoriesParam = searchParams.get("categories");
    const experienceLevel = searchParams.get("experience_level");
    const limit = searchParams.get("limit");

    // Validate required fields
    if (!platformId) {
      return NextResponse.json(
        { error: "platform_id query parameter is required" },
        { status: 400 }
      );
    }

    if (!categoriesParam) {
      return NextResponse.json(
        { error: "categories query parameter is required (comma-separated)" },
        { status: 400 }
      );
    }

    // Parse categories
    const categories = categoriesParam.split(",").map((c) => c.trim());

    // Validate platform_id
    const validPlatforms = [
      "windows",
      "macos",
      "ubuntu",
      "debian",
      "arch",
      "fedora",
    ];
    if (!validPlatforms.includes(platformId)) {
      return NextResponse.json(
        {
          error: `Invalid platform_id. Must be one of: ${validPlatforms.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Set default limit
    const parsedLimit =
      limit && parseInt(limit) > 0 && parseInt(limit) <= 50
        ? parseInt(limit)
        : 20;

    // Generate recommendations
    const recommendations = await RecommendationService.generateRecommendations(
      {
        platform_id: platformId,
        categories: categories as any,
        experienceLevel: experienceLevel as any,
        limit: parsedLimit,
      }
    );

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
      userProfile: {
        categories,
        platform: platformId,
        experienceLevel,
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
