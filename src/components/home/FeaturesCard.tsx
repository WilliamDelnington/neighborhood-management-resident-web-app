import React, { useState } from "react";
import { Box, Text } from "@components/ui";
import { UtinityItem } from "@components/utilities";
import { Utinity } from "@dts";

export interface FeaturesCardProps {
    features: Utinity[];
    initialCount?: number;
}

/**
 * Single "Tien ich" card on Home - shows the first `initialCount` features
 * (the most-used ones, in caller-supplied priority order) and reveals the
 * rest in place behind a "Xem thêm" toggle instead of navigating away.
 * Replaces what used to be two separate sections (a hero quick-actions grid
 * plus a second "more features" card) - see HomePage.tsx for how the two
 * lists are combined before being passed in here.
 */
const FeaturesCard: React.FC<FeaturesCardProps> = ({
    features,
    initialCount = 6,
}) => {
    const [expanded, setExpanded] = useState(false);

    if (features.length === 0) return null;

    const visible = expanded ? features : features.slice(0, initialCount);
    const hasMore = features.length > initialCount;

    return (
        <Box className="bg-white mt-2 p-4">
            <Text.Title size="small" className="mb-3">
                Nhóm dịch vụ
            </Text.Title>
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                }}
            >
                {visible.map(item => {
                    const { key, ...utinity } = item;
                    return <UtinityItem key={key} {...utinity} />;
                })}
            </Box>
            {hasMore && (
                <Box
                    mt={3}
                    flex
                    justifyContent="center"
                    onClick={() => setExpanded(value => !value)}
                >
                    <Text size="xSmall" className="text-main">
                        {expanded ? "Thu gọn" : "Xem thêm"}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default FeaturesCard;
