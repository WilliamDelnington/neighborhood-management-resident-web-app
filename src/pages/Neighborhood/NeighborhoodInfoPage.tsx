import React, { useEffect, useState } from "react";
import { Box, Text } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { EmptyState, ErrorState, LoadingState } from "@components/admin";
import { RequireAuth } from "@components/role";
import { fetchMyNeighborhoods } from "@service/neighborhoodApi";
import { MyNeighborhoodInfo } from "@dts";

const NeighborhoodInfoPage: React.FC = () => (
    <RequireAuth>
        <NeighborhoodInfoContent />
    </RequireAuth>
);

/**
 * Thong tin to dan pho (C03) - phien ban cong khai an toan, chi hien ten, dia
 * chi, mo ta, lien he to truong/to pho cua to dan pho gan voi nha cua nguoi
 * dang dang nhap. Khong hien danh sach nha/ho dan (do la du lieu quan ly noi
 * bo, xem /admin/houses).
 */
const NeighborhoodInfoContent: React.FC = () => {
    const [items, setItems] = useState<MyNeighborhoodInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchMyNeighborhoods()
            .then(setItems)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <PageLayout
            id="neighborhood-info-page"
            title="Tổ dân phố của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Chưa xác định được tổ dân phố cho nhà của bạn." />
                )}
                {!loading &&
                    !error &&
                    items.map(({ neighborhood, coleaders }) => (
                        <Box
                            key={neighborhood._id}
                            className="bg-white rounded-2xl p-4 shadow-card mt-3"
                        >
                            <Text size="small" className="font-medium">
                                {neighborhood.name}
                            </Text>
                            {neighborhood.address && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-1"
                                >
                                    {neighborhood.address}
                                </Text>
                            )}
                            {neighborhood.description && (
                                <Text size="xSmall" className="mt-2">
                                    {neighborhood.description}
                                </Text>
                            )}

                            <Text size="xSmall" className="font-medium mt-3">
                                Liên hệ
                            </Text>
                            {neighborhood.leaderUserId && (
                                <Text size="xSmall" className="mt-1">
                                    Tổ trưởng:{" "}
                                    {neighborhood.leaderUserId.displayName}
                                    {neighborhood.leaderUserId.phone
                                        ? ` — ${neighborhood.leaderUserId.phone}`
                                        : ""}
                                </Text>
                            )}
                            {!neighborhood.leaderUserId &&
                                neighborhood.contactPhone && (
                                    <Text size="xSmall" className="mt-1">
                                        Điện thoại: {neighborhood.contactPhone}
                                    </Text>
                                )}
                            {coleaders.map(c => (
                                <Text
                                    key={c._id}
                                    size="xSmall"
                                    className="mt-1"
                                >
                                    Tổ phó: {c.coleaderUserId.displayName}
                                    {c.coleaderUserId.phone
                                        ? ` — ${c.coleaderUserId.phone}`
                                        : ""}
                                </Text>
                            ))}
                            {!neighborhood.leaderUserId &&
                                coleaders.length === 0 &&
                                !neighborhood.contactPhone && (
                                    <Text
                                        size="xSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Chưa có thông tin liên hệ.
                                    </Text>
                                )}
                        </Box>
                    ))}
            </Box>
        </PageLayout>
    );
};

export default NeighborhoodInfoPage;
