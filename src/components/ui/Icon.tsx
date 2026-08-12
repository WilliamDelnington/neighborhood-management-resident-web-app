import React, { FC } from "react";
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Clock,
    MapPin,
    File,
    Copy,
    Bell,
    ArrowLeft,
    Download,
    AlertTriangle,
    CheckCircle2,
    X,
    Home,
    Settings,
    User,
    LucideProps,
} from "lucide-react";

// Maps the app's zmp-ui "zi-*" icon names (Zalo's icon set) to lucide-react
// equivalents, so call sites (icon="zi-plus") don't need to change.
const ICON_MAP: Record<string, FC<LucideProps>> = {
    "zi-chevron-right": ChevronRight,
    "zi-chevron-left": ChevronLeft,
    "zi-plus": Plus,
    "zi-clock-1": Clock,
    "zi-location": MapPin,
    "zi-file": File,
    "zi-copy": Copy,
    "zi-notif": Bell,
    "zi-arrow-left": ArrowLeft,
    "zi-download": Download,
    "zi-warning-solid": AlertTriangle,
    "zi-check-circle-solid": CheckCircle2,
    "zi-close": X,
    "zi-home": Home,
    "zi-setting": Settings,
    "zi-user": User,
};

export interface IconProps {
    icon: string;
    className?: string;
    style?: React.CSSProperties;
    size?: number | string;
}

const Icon: FC<IconProps> = ({ icon, className, style, size = 20 }) => {
    const LucideIcon = ICON_MAP[icon];
    if (!LucideIcon) {
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn(`Icon: no mapping for "${icon}"`);
        }
        return null;
    }
    return <LucideIcon className={className} style={style} size={size} />;
};

export default Icon;
