# Smart Package Recommendations Feature

## 📋 Overview

This feature adds intelligent package recommendations to RepoHub based on user preferences, operating system, and experience level. It provides a personalized onboarding experience and curated package suggestions.

## ✨ Key Features

### 1. **Onboarding Modal**
- 3-step wizard for new users
- Category selection (up to 3 categories)
- OS detection with manual override option
- **Auto-fallback to Ubuntu** when OS detection fails
- Experience level selection (beginner/intermediate/advanced)
- Persistent localStorage-based profile with **version control**

### 2. **Smart Recommendations**
- Hybrid scoring algorithm:
  - Category match: 40%
  - Popularity: 30%
  - OS compatibility: 20%
  - Preset boost: 10%
- Curated preset packages for 7 categories
- Real-time filtering based on user profile
- **Optimized package fetching** (reduced N+1 queries)
- **Case-insensitive** package name matching

### 3. **Categories Supported**
- 💻 **Development**: IDEs, version control, programming languages
- 🎨 **Design**: Graphics editors, 3D tools, UI/UX software
- 🎬 **Multimedia**: Video/audio editing, media players
- ⚙️ **System Tools**: Admin tools, utilities, monitoring
- 🎮 **Gaming**: Game platforms, communication tools
- 📝 **Productivity**: Office suites, note-taking, password managers
- 🎓 **Education**: Learning tools, scientific software

## 🏗️ Architecture

### Components

```
src/
├── types/
│   └── recommendations.ts          # Type definitions
├── data/
│   └── recommendationPresets.ts    # Hardcoded package presets
├── services/
│   └── recommendationService.ts    # Recommendation algorithm
├── hooks/
│   └── useRecommendationProfile.ts # localStorage management + OS detection
├── components/
│   ├── OnboardingModal.tsx         # User onboarding wizard
│   └── RecommendationsSection.tsx  # Recommendation display
└── app/api/
    └── recommendations/
        └── route.ts                # API endpoint
```

### Data Flow

```
1. First Visit
   └→ useRecommendationProfile detects !hasCompletedOnboarding
   └→ OnboardingModal opens automatically
   └→ User selects categories, OS, experience level
   └→ Profile saved to localStorage
   └→ hasCompletedOnboarding = true

2. Recommendations
   └→ RecommendationsSection fetches from /api/recommendations
   └→ POST { platform_id, categories, experienceLevel }
   └→ RecommendationService.generateRecommendations()
   └→ Fetch preset packages (exact name match)
   └→ Fetch category packages (popularity-based)
   └→ Score each package (hybrid algorithm)
   └→ Return top 12 recommendations

3. User Actions
   └→ Click "Customize Preferences" → Reopen OnboardingModal
   └→ Click "Refresh Recommendations" → Refetch recommendations
   └→ Click package card → Add to selection
```

## 🔧 API Usage

### POST /api/recommendations

**Request:**
```json
{
  "platform_id": "ubuntu",
  "categories": ["development", "productivity"],
  "experienceLevel": "intermediate",
  "limit": 12
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "pkg-uuid",
      "name": "git",
      "description": "Version control system",
      "version": "2.43.0",
      "recommendationScore": 95,
      "recommendationReason": "Version control system essential for all developers",
      "presetMatch": true,
      ...
    }
  ],
  "total": 12,
  "userProfile": {
    "categories": ["development", "productivity"],
    "platform": "ubuntu",
    "experienceLevel": "intermediate"
  }
}
```

### GET /api/recommendations

Query parameters version (alternative to POST):
```
GET /api/recommendations?platform_id=ubuntu&categories=development,productivity&experience_level=intermediate&limit=12
```

## 🎨 UI/UX Features

### Onboarding Modal
- **Step 1**: Category selection with icons and descriptions
- **Step 2**: OS selection (auto-detected + manual override)
- **Step 3**: Experience level with detailed descriptions
- Progress indicator (3 dots)
- Back/Next navigation
- Validation (can't proceed without required selections)

### Recommendations Section
- Grid layout (responsive: 1/2/3 columns)
- Package cards with:
  - "Essential" badge for preset matches
  - Recommendation score (0-100%) with progress bar
  - Recommendation reason
  - Version info
  - Add to selection button
- User profile pills (OS + categories)
- Refresh button
- Customize preferences button

## 🌍 i18n Support

Full English and Turkish translations for:
- Onboarding flow
- Category names and descriptions
- Experience levels
- Recommendation UI labels
- Button text

Translation keys:
- `onboarding.*`
- `categories.*`
- `recommendations.*`

## 💾 localStorage Schema

```typescript
// Key: 'repohub_user_profile'
{
  categories: ['development', 'productivity'],
  detectedOS: 'ubuntu',
  selectedOS?: 'arch',              // Manual override
  experienceLevel: 'intermediate',
  hasCompletedOnboarding: true,
  createdAt: '2025-11-22T10:00:00Z',
  lastUpdated: '2025-11-22T12:30:00Z'
}
```

## 🧪 Testing Checklist

- [ ] First visit triggers onboarding modal
- [ ] OS detection works correctly (Windows/macOS/Linux)
- [ ] Category selection validates (max 3)
- [ ] Profile persists across page reloads
- [ ] Recommendations update when profile changes
- [ ] Package cards are clickable and add to selection
- [ ] "Customize Preferences" reopens onboarding
- [ ] "Refresh Recommendations" fetches new data
- [ ] i18n works (EN/TR switching)
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Loading states display correctly
- [ ] Error states handle gracefully

## 🔮 Future Enhancements

### Phase 2 (Post-MVP)
- [ ] Database storage for user profiles (optional account system)
- [ ] Community ratings for packages
- [ ] User feedback loop (like/dislike recommendations)
- [ ] A/B testing for algorithm weights
- [ ] Admin panel for managing presets

### Phase 3 (ML-Ready)
- [ ] Collaborative filtering
- [ ] Package co-occurrence analysis
- [ ] Time-based trending packages
- [ ] Machine learning model integration

## 📊 Scoring Algorithm Details

### Hybrid Scoring Formula
```typescript
score = 
  (category_match * 0.4) +
  (popularity_score / 100 * 0.3) +
  (os_compatibility * 0.2) +
  (preset_priority / 10 * 0.1)
```

### Category Match
- Preset package: 1.0 (perfect match)
- Non-preset package: 0.5 (generic match)

### Popularity Score
- Normalized from 0-100 (from database)
- Higher popularity = better recommendation

### OS Compatibility
- All packages from DB are compatible = 1.0
- Future: could penalize packages with known issues

### Preset Priority
- Range: 1-10 (defined in presets)
- Normalized to 0.1-1.0
- Only applies to preset packages

## 🚀 Deployment Notes

1. No database migrations required (uses existing schema)
2. No environment variables needed (feature is client-side first)
3. Compatible with existing API structure
4. Progressive enhancement (works without JS for basic browse)

## 📝 Code Quality

- ✅ TypeScript strict mode
- ✅ Full type coverage
- ✅ ESLint compliant
- ✅ Responsive design
- ✅ Accessibility (keyboard navigation)
- ✅ Error boundaries
- ✅ Loading states

## 🔗 Related Files

- Issue: https://github.com/yusufipk/RepoHub/issues/1
- Branch: `feature/smart-package-recommendations`

---

**Developed by:** @ersaayan  
**Date:** November 22, 2025  
**Status:** ✅ Ready for Review
