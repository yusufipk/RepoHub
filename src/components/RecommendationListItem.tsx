import { Package as PackageIcon, Star, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecommendedPackage } from '@/types/recommendations'

interface RecommendationListItemProps {
    pkg: RecommendedPackage
    isSelected: boolean
    onToggle: (pkg: RecommendedPackage) => void
}

export function RecommendationListItem({ pkg, isSelected, onToggle }: RecommendationListItemProps) {
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
            onClick={() => onToggle(pkg)}
        >
            {/* Package Icon */}
            <PackageIcon className="h-6 w-6 text-primary flex-shrink-0" />

            {/* Package Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{pkg.name}</h4>
                    {pkg.presetMatch && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
                            <Star className="h-2.5 w-2.5" />
                            Essential
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">{pkg.version}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{pkg.description}</p>
            </div>

            {/* Score Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                    <div className="text-xs font-semibold text-primary">
                        {pkg.recommendationScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">match</div>
                </div>

                {/* Info Tooltip */}
                {pkg.recommendationReason && (
                    <div className="relative group">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <p className="font-semibold mb-1">Why recommended?</p>
                            <p>{pkg.recommendationReason}</p>
                        </div>
                    </div>
                )}

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
        </div>
    )
}
