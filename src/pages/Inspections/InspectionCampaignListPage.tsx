import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth, hasPermission } from "@components/role";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { Button } from "@components/customized";
import { useStore } from "@store";
import type { InspectionCampaign } from "@dts";
import { fetchInspectionCampaigns } from "@service/inspectionApi";

const InspectionCampaignListPage: React.FC = () => (
    <RequireAuth>
        <InspectionCampaignListContent />
    </RequireAuth>
);

const InspectionCampaignListContent: React.FC = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "inspections.read");
    const [items, setItems] = useState<InspectionCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchInspectionCampaigns()
            .then(data => setItems(data.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (canView) load();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canView]);

    if (!canView) {
        return (
            <PageLayout id="inspection-denied" title="Rà soát chiến dịch">
                <Box p={6}>
                    <Text size="small" className="text-text_2 text-center">
                        Tài khoản chưa có quyền xem chiến dịch.
                    </Text>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout id="inspection-campaign-list" title="Rà soát chiến dịch">
            <Box p={4}>
                {loading && <LoadingState label="Đang tải chiến dịch..." />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Chưa có chiến dịch được giao" />
                )}
                {!loading &&
                    !error &&
                    items.map(item => (
                        <Box
                            key={item._id}
                            className="bg-white rounded-2xl p-4 mb-3 shadow-card"
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box className="min-w-0 pr-2">
                                    <Text.Title size="small">
                                        {item.name}
                                    </Text.Title>
                                    <Text
                                        size="xSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        {item.purpose}
                                    </Text>
                                </Box>
                                <StatusBadge
                                    label={
                                        item.status === "ACTIVE"
                                            ? "Đang làm"
                                            : item.status
                                    }
                                    tone={
                                        item.status === "ACTIVE"
                                            ? "blue"
                                            : "gray"
                                    }
                                />
                            </Box>
                            <Text size="xxSmall" className="text-text_2 mt-3">
                                Hạn{" "}
                                {new Date(item.dueAt).toLocaleDateString(
                                    "vi-VN",
                                )}{" "}
                                · {item.checklistTemplate.length} mục
                                {item.requiredEvidence
                                    ? " · Có minh chứng"
                                    : ""}
                            </Text>
                            <Box mt={3}>
                                <Button
                                    fullWidth
                                    onClick={() =>
                                        navigate(`/inspections/${item._id}`, {
                                            animate: true,
                                        })
                                    }
                                >
                                    Xem danh sách Nhà
                                </Button>
                            </Box>
                        </Box>
                    ))}
            </Box>
        </PageLayout>
    );
};

export default InspectionCampaignListPage;
