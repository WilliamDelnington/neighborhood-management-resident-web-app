import React, { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { Box, Text, useNavigate, useParams } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth, hasPermission } from "@components/role";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
    type BadgeTone,
} from "@components/admin";
import { Button } from "@components/customized";
import { useStore } from "@store";
import type {
    InspectionCampaign,
    InspectionResultStatus,
    InspectionTarget,
} from "@dts";
import {
    fetchInspectionCampaign,
    fetchInspectionTargets,
} from "@service/inspectionApi";

const STATUS: Record<
    InspectionResultStatus,
    { label: string; tone: BadgeTone }
> = {
    PENDING: { label: "Chưa làm", tone: "gray" },
    DRAFT: { label: "Bản nháp", tone: "yellow" },
    SUBMITTED: { label: "Chờ xác minh", tone: "blue" },
    VERIFIED: { label: "Đã xác minh", tone: "green" },
    REQUEST_REVISION: { label: "Cần bổ sung", tone: "red" },
    FIELD_CHECK_REQUIRED: { label: "Kiểm tra thực địa", tone: "yellow" },
};

const InspectionCampaignDetailPage: React.FC = () => (
    <RequireAuth>
        <InspectionCampaignDetailContent />
    </RequireAuth>
);

const InspectionCampaignDetailContent: React.FC = () => {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "inspections.read");
    const [campaign, setCampaign] = useState<InspectionCampaign | null>(null);
    const [targets, setTargets] = useState<InspectionTarget[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        Promise.all([
            fetchInspectionCampaign(id),
            fetchInspectionTargets(id, filter || undefined),
        ])
            .then(([campaignData, targetData]) => {
                setCampaign(campaignData);
                setTargets(targetData.items);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (canView) load();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, filter, canView]);

    if (!canView) {
        return (
            <PageLayout id="inspection-detail-denied" title="Chiến dịch">
                <Box p={6}>
                    <Text size="small" className="text-center text-text_2">
                        Bạn không có quyền truy cập.
                    </Text>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            id="inspection-campaign-detail"
            title={campaign?.name || "Chiến dịch"}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && campaign && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-card">
                            <Text.Title size="small">
                                {campaign.name}
                            </Text.Title>
                            <Text size="xSmall" className="text-text_2 mt-1">
                                {campaign.purpose}
                            </Text>
                            <Text size="xxSmall" className="text-text_2 mt-2">
                                Hạn{" "}
                                {new Date(campaign.dueAt).toLocaleDateString(
                                    "vi-VN",
                                )}
                            </Text>
                            {campaign.summary && (
                                <Box className="grid grid-cols-3 gap-2 mt-3">
                                    <Box className="bg-ng_10 rounded-lg p-2 text-center">
                                        <Text.Title size="small">
                                            {campaign.summary.totalHouses}
                                        </Text.Title>
                                        <Text size="xxSmall">Tổng Nhà</Text>
                                    </Box>
                                    <Box className="bg-green-50 rounded-lg p-2 text-center">
                                        <Text.Title size="small">
                                            {campaign.summary.pass}
                                        </Text.Title>
                                        <Text size="xxSmall">Đạt</Text>
                                    </Box>
                                    <Box className="bg-amber-50 rounded-lg p-2 text-center">
                                        <Text.Title size="small">
                                            {campaign.summary.unchecked}
                                        </Text.Title>
                                        <Text size="xxSmall">
                                            Chưa kiểm tra
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <Box className="bg-white rounded-2xl p-3 mt-3 shadow-card">
                            <Text size="xxSmall" className="text-text_2">
                                Lọc kết quả
                            </Text>
                            <select
                                id="inspection-filter"
                                className="w-full mt-2 rounded-lg bg-ng_10 p-3 text-sm"
                                value={filter}
                                onChange={event =>
                                    setFilter(event.target.value)
                                }
                            >
                                <option value="">Tất cả Nhà số</option>
                                {Object.entries(STATUS).map(([value, meta]) => (
                                    <option key={value} value={value}>
                                        {meta.label}
                                    </option>
                                ))}
                            </select>
                        </Box>
                        <Box mt={3}>
                            {targets.length === 0 && (
                                <EmptyState
                                    label="Không có Nhà số phù hợp"
                                    icon={SearchX}
                                    tone="success"
                                />
                            )}
                            {targets.map(target => {
                                const house =
                                    typeof target.houseId === "string"
                                        ? null
                                        : target.houseId;
                                return (
                                    <Box
                                        key={target._id}
                                        className="bg-white rounded-2xl p-4 mb-3 shadow-card"
                                    >
                                        <Box
                                            flex
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box className="pr-2">
                                                <Text.Title size="small">
                                                    Nhà {house?.code || "—"}
                                                </Text.Title>
                                                <Text
                                                    size="xSmall"
                                                    className="text-text_2 mt-1"
                                                >
                                                    {house?.address || "—"}
                                                </Text>
                                            </Box>
                                            <StatusBadge
                                                label={
                                                    STATUS[target.resultStatus]
                                                        .label
                                                }
                                                tone={
                                                    STATUS[target.resultStatus]
                                                        .tone
                                                }
                                            />
                                        </Box>
                                        <Box mt={3}>
                                            <Button
                                                fullWidth
                                                onClick={() =>
                                                    navigate(
                                                        `/inspections/targets/${target._id}`,
                                                        { animate: true },
                                                    )
                                                }
                                            >
                                                {target.result
                                                    ? "Mở kết quả"
                                                    : "Bắt đầu rà soát"}
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

export default InspectionCampaignDetailPage;
