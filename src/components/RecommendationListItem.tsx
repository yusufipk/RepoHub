import { useState } from 'react'
import { Package as PackageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecommendedPackage } from '@/types/recommendations'

interface RecommendationListItemProps {
    pkg: RecommendedPackage
    isSelected: boolean
    onToggle: (pkg: RecommendedPackage) => void
}

export function RecommendationListItem({ pkg, isSelected, onToggle }: RecommendationListItemProps) {
    const [iconError, setIconError] = useState(false)

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
                }`}
            onClick={() => onToggle(pkg)}
        >
            {/* Package Icon */}
            {pkg.icon && !iconError ? (
                <>
                    <div 
                        className="h-6 w-6 flex-shrink-0 bg-foreground"
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
                <PackageIcon className="h-6 w-6 text-foreground flex-shrink-0" />
            )}

            {/* Package Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{pkg.name}</h4>
                    <span className="text-xs text-muted-foreground">{pkg.version}</span>
                </div>
            </div>



            {/* Select Button */}
            <Button
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="ml-2"
                onClick={(e) => {
                    e.stopPropagation()
                    onToggle(pkg)
                }}
            >
                {isSelected ? '✓' : '+'}
            </Button>
        </div>

    )
}
