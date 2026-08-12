import React, { ReactNode } from "react";
import { Box, Icon, Text } from "@components/ui";

export interface ListRowProps {
    title: string;
    subtitle?: string;
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
    right,
    onClick,
}) => (
    <Box
        flex
        alignItems="center"
        justifyContent="space-between"
        py={3}
        className="border-b border-divider_01 last:border-0"
        onClick={onClick}
    >
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

export default ListRow;
