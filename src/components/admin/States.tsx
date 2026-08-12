import React from "react";
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

export const EmptyState: React.FC<{ label?: string }> = ({
    label = "Chưa có dữ liệu",
}) => (
    <Box
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={8}
    >
        <Text size="small" className="text-text_2">
            {label}
        </Text>
    </Box>
);

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
        <Text size="small" className="text-red-500 mb-2">
            {label}
        </Text>
        {onRetry && (
            <Text size="xSmall" className="text-main" onClick={onRetry}>
                Thử lại
            </Text>
        )}
    </Box>
);
