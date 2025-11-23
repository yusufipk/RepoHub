import { useState } from 'react'
import { Package as PackageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecommendedPackage } from '@/types/recommendations'
import { useLocale } from '@/contexts/LocaleContext'

interface RecommendationCardProps {
    pkg: RecommendedPackage
    isSelected: boolean
    onToggle: (pkg: RecommendedPackage) => void
}

export function RecommendationCard({ pkg, isSelected, onToggle }: RecommendationCardProps) {
    const { t } = useLocale()
    const [iconError, setIconError] = useState(false)

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''
                }`}
            onClick={() => onToggle(pkg)}
        >


            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    {pkg.icon && !iconError ? (
                        <>
                            <div 
                                className="h-8 w-8 flex-shrink-0 bg-foreground"
                                style={{
                                    maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${pkg.icon}.svg)`,
                                    WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${pkg.icon}.svg)`,
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center'
                                }}
                            />
                            {/* Hidden image to detect load errors */}
                            <img 
                                src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${pkg.icon}.svg`}
                                alt=""
                                className="hidden"
                                onError={() => setIconError(true)}
                            />
                        </>
                    ) : (
                        <PackageIcon className="h-8 w-8 text-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.version}</p>
                    </div>
                </div>

                <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggle(pkg)
                    }}
                >
                    {isSelected ? '✓ Selected' : t('recommendations.add_to_selection')}
                </Button>
            </CardContent>
        </Card>
    )
}
