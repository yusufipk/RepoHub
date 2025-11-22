"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { UserCategory, ExperienceLevel } from '@/types/recommendations'
import { useLocale } from '@/contexts/LocaleContext'
import { RECOMMENDATION_PRESETS } from '@/data/recommendationPresets'

interface OnboardingModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete: (data: {
        categories: UserCategory[]
        selectedOS?: string
        experienceLevel: ExperienceLevel
    }) => void
    detectedOS: string
}

const PLATFORMS = [
    { id: 'windows', name: 'Windows', icon: '🪟' },
    { id: 'macos', name: 'macOS', icon: '🍎' },
    { id: 'ubuntu', name: 'Ubuntu', icon: '🐧' },
    { id: 'debian', name: 'Debian', icon: '🐧' },
    { id: 'arch', name: 'Arch Linux', icon: '🏛️' },
    { id: 'fedora', name: 'Fedora', icon: '🎩' }
]

export function OnboardingModal({
    isOpen,
    onClose,
    onComplete,
    detectedOS
}: OnboardingModalProps) {
    const { t } = useLocale()
    const [step, setStep] = useState(1)
    const [selectedCategories, setSelectedCategories] = useState<UserCategory[]>([])
    // Default to ubuntu if OS detection fails
    const [selectedOS, setSelectedOS] = useState<string>(
        detectedOS !== 'unknown' ? detectedOS : 'ubuntu'
    )
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner')

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1)
            // Keep current OS selection or use detected
            setSelectedOS(detectedOS !== 'unknown' ? detectedOS : 'ubuntu')
        }
    }, [isOpen, detectedOS])

    if (!isOpen) return null

    const handleCategoryToggle = (category: UserCategory) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category)
            }
            // Limit to 3 categories
            if (prev.length >= 3) {
                return [...prev.slice(1), category]
            }
            return [...prev, category]
        })
    }

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleComplete = () => {
        if (selectedCategories.length === 0) {
            return
        }

        onComplete({
            categories: selectedCategories,
            selectedOS: selectedOS,
            experienceLevel
        })

        // Close modal
        onClose()
    }

    const canProceed = () => {
        if (step === 1) return selectedCategories.length > 0
        if (step === 2) return selectedOS !== 'unknown'
        if (step === 3) return true
        return false
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">
                            {t('onboarding.title')}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {t('onboarding.subtitle')}
                    </CardDescription>

                    {/* Progress indicator */}
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            />
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Categories */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('onboarding.step1.title')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('onboarding.step1.description')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {RECOMMENDATION_PRESETS.map(preset => (
                                    <button
                                        key={preset.category}
                                        onClick={() => handleCategoryToggle(preset.category)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${selectedCategories.includes(preset.category)
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{preset.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold capitalize">
                                                    {t(`categories.${preset.category}.name`)}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {t(`categories.${preset.category}.description`)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedCategories.length > 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    {t('onboarding.step1.selected', { count: selectedCategories.length })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 2: Operating System */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('onboarding.step2.title')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('onboarding.step2.description')}
                                </p>
                                {detectedOS !== 'unknown' && (
                                    <p className="text-sm text-primary mb-4">
                                        {t('onboarding.step2.detected', { os: detectedOS })}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PLATFORMS.map(platform => (
                                    <button
                                        key={platform.id}
                                        onClick={() => setSelectedOS(platform.id)}
                                        className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${selectedOS === platform.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{platform.icon}</div>
                                        <div className="font-semibold text-sm">{platform.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Experience Level */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('onboarding.step3.title')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('onboarding.step3.description')}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setExperienceLevel(level)}
                                        className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${experienceLevel === level
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <h4 className="font-semibold capitalize mb-1">
                                            {t(`onboarding.step3.levels.${level}.name`)}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {t(`onboarding.step3.levels.${level}.description`)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                {t('common.back')}
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1"
                            >
                                {t('common.next')}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed()}
                                className="flex-1"
                            >
                                {t('onboarding.complete')}
                                <Sparkles className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
