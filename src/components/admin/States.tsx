import React from "react";
import { AlertTriangle, Inbox, LucideIcon } from "lucide-react";
import { Box, Spinner, Text } from "@components/ui";

export const LoadingState: React.FC<{ label?: string }> = ({
    label = "Đang tải...",
}) => (
    <Box
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={8}
    >
        <Spinner visible />
        <Text size="xSmall" className="text-text_2 mt-2">
            {label}
        </Text>
    </Box>
);

export type EmptyStateTone =
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

// Mau nen/icon theo tung tone - dung chung mau semantic da co trong
// tailwind.config.js (success/warning/danger/info) de cac trang trong
// (danh sach chua co du lieu) khong bi lap lai cung mot mau/icon nhu nhau.
const TONE_STYLES: Record<EmptyStateTone, { bg: string; color: string }> = {
    primary: { bg: "#ECFEFF", color: "#0891B2" },
    success: { bg: "#DCFCE7", color: "#16A34A" },
    warning: { bg: "#FEF3C7", color: "#D97706" },
    danger: { bg: "#FEE2E2", color: "#DC2626" },
    info: { bg: "#E0E7FF", color: "#4338CA" },
};

export const EmptyState: React.FC<{
    label?: string;
    icon?: LucideIcon;
    tone?: EmptyStateTone;
}> = ({ label = "Chưa có dữ liệu", icon: Icon = Inbox, tone = "primary" }) => {
    const { bg, color } = TONE_STYLES[tone];
    return (
        <Box
            flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={8}
        >
            <Box
                flex
                alignItems="center"
                justifyContent="center"
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: bg,
                    marginBottom: 12,
                }}
            >
                <Icon size={26} color={color} />
            </Box>
            <Text size="small" className="text-text_2 text-center">
                {label}
            </Text>
        </Box>
    );
};

export const ErrorState: React.FC<{ label?: string; onRetry?: () => void }> = ({
    label = "Đã xảy ra lỗi, vui lòng thử lại",
    onRetry,
}) => (
    <Box
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={8}
    >
        <Box
            flex
            alignItems="center"
            justifyContent="center"
            style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#FEE2E2",
                marginBottom: 12,
            }}
        >
            <AlertTriangle size={26} color="#DC2626" />
        </Box>
        <Text size="small" className="text-red-500 mb-2 text-center">
            {label}
        </Text>
        {onRetry && (
            <Text size="xSmall" className="text-main" onClick={onRetry}>
                Thử lại
            </Text>
        )}
    </Box>
);
