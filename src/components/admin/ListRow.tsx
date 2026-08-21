import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Box, Icon, Text } from "@components/ui";

export type ListRowTone = "primary" | "success" | "warning" | "danger" | "info";

// Cung bang mau voi EmptyState (components/admin/States.tsx) de icon dau
// dong danh sach va icon trang trong dong bo mot bang mau xuyen suot app.
const TONE_STYLES: Record<ListRowTone, { bg: string; color: string }> = {
    primary: { bg: "#ECFEFF", color: "#0891B2" },
    success: { bg: "#DCFCE7", color: "#16A34A" },
    warning: { bg: "#FEF3C7", color: "#D97706" },
    danger: { bg: "#FEE2E2", color: "#DC2626" },
    info: { bg: "#E0E7FF", color: "#4338CA" },
};

export interface ListRowProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    tone?: ListRowTone;
    right?: ReactNode;
    onClick?: () => void;
}

/**
 * Dong danh sach cham duoc, dung thay cho bang du lieu desktop tren man hinh mobile
 * (theo yeu cau: tranh tran ngang, dung the tom tat + man hinh chi tiet).
 */
const ListRow: React.FC<ListRowProps> = ({
    title,
    subtitle,
    icon: LeadingIcon,
    tone = "primary",
    right,
    onClick,
}) => {
    const { bg, color } = TONE_STYLES[tone];
    return (
        <Box
            flex
            alignItems="center"
            justifyContent="space-between"
            py={3}
            className="border-b border-divider_01 last:border-0"
            onClick={onClick}
            style={{ gap: 12 }}
        >
            {LeadingIcon && (
                <Box
                    flex
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: bg,
                        flexShrink: 0,
                    }}
                >
                    <LeadingIcon size={20} color={color} />
                </Box>
            )}
            <Box flex flexDirection="column" style={{ flex: 1, minWidth: 0 }}>
                <Text size="small" className="font-medium truncate">
                    {title}
                </Text>
                {subtitle && (
                    <Text size="xxSmall" className="text-text_2 truncate">
                        {subtitle}
                    </Text>
                )}
            </Box>
            <Box flex alignItems="center" style={{ gap: 8, flexShrink: 0 }}>
                {right}
                {onClick && (
                    <Icon icon="zi-chevron-right" className="text-text_3" />
                )}
            </Box>
        </Box>
    );
};

export default ListRow;
