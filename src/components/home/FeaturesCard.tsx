import React, { useState } from "react";
import { Box, Icon, Text } from "@components/ui";
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
        <Box className="bg-white mx-4 mt-3 p-4 rounded-2xl shadow-card">
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
                    mt={2}
                    flex
                    alignItems="center"
                    justifyContent="center"
                    style={{ gap: 4, minHeight: 44, cursor: "pointer" }}
                    onClick={() => setExpanded(value => !value)}
                >
                    <Text size="xSmall" className="text-main font-medium">
                        {expanded ? "Thu gọn" : "Xem thêm"}
                    </Text>
                    <Icon
                        icon="zi-chevron-right"
                        size={14}
                        className="text-main"
                        style={{
                            transform: `rotate(${expanded ? -90 : 90}deg)`,
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default FeaturesCard;
