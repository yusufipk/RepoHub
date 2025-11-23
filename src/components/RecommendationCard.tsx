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

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''
                }`}
            onClick={() => onToggle(pkg)}
        >


            <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <PackageIcon className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.version}</p>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {pkg.description}
                </p>



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
