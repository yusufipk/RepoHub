import {
    Code,
    Palette,
    Film,
    Cpu,
    Gamepad2,
    CheckSquare,
    GraduationCap,
    LucideIcon
} from 'lucide-react';
import { UserCategory } from '@/types/recommendations';

export const CATEGORY_ICONS: Record<UserCategory, LucideIcon> = {
    development: Code,
    design: Palette,
    multimedia: Film,
    "system-tools": Cpu,
    gaming: Gamepad2,
    productivity: CheckSquare,
    education: GraduationCap,
};
