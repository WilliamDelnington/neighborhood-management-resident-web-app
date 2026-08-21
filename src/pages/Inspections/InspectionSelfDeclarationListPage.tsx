import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
    type BadgeTone,
} from "@components/admin";
import { Button } from "@components/customized";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";
import type { InspectionSelfDeclarationListItem } from "@dts";
import { fetchMyInspectionSelfDeclarations } from "@service/inspectionApi";

const statusLabel = (status: string) =>
    ({
        SENT: "Chờ khai",
        DRAFT: "Bản nháp",
        SUBMITTED: "Đã gửi",
        VERIFIED: "Đã xác minh",
        REQUEST_REVISION: "Cần bổ sung",
        FIELD_CHECK_REQUIRED: "Cần kiểm tra thực địa",
    }[status] || status);

const statusTone = (status: string): BadgeTone => {
    if (status === "REQUEST_REVISION") return "yellow";
    if (status === "VERIFIED") return "green";
    return "blue";
};

const InspectionSelfDeclarationListPage: React.FC = () => (
    <RequireAuth>
        <InspectionSelfDeclarationListContent />
    </RequireAuth>
);

const InspectionSelfDeclarationListContent: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<InspectionSelfDeclarationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchMyInspectionSelfDeclarations()
            .then(data => setItems(data.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <PageLayout
            id="inspection-self-declaration-list"
            title="Biểu mẫu tự khai"
        >
            <Box p={4}>
                <Text size="xSmall" className="block text-text_2 mb-4">
                    Các biểu mẫu rà soát được Tổ dân phố gửi tới Nhà số bạn đang
                    quản lý.
                </Text>
                {loading && <LoadingState label="Đang tải biểu mẫu..." />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Chưa có biểu mẫu tự khai nào" />
                )}
                {!loading &&
                    !error &&
                    items.map(({ target, campaign }) => {
                        const house =
                            typeof target.houseId === "string"
                                ? null
                                : target.houseId;
                        const status =
                            target.resultStatus === "PENDING"
                                ? target.selfDeclarationStatus
                                : target.resultStatus;
                        return (
                            <Box
                                key={target._id}
                                className="mb-3 rounded-2xl bg-white p-4 shadow-card"
                            >
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                >
                                    <Box className="min-w-0 pr-2">
                                        <Text.Title size="small">
                                            {campaign.name}
                                        </Text.Title>
                                        <Text
                                            size="xSmall"
                                            className="mt-1 text-text_2"
                                        >
                                            Nhà {house?.code || "—"} ·{" "}
                                            {house?.address || "—"}
                                        </Text>
                                    </Box>
                                    <StatusBadge
                                        label={statusLabel(status)}
                                        tone={statusTone(status)}
                                    />
                                </Box>
                                <Text
                                    size="xxSmall"
                                    className="mt-3 block text-text_2"
                                >
                                    Hạn{" "}
                                    {new Date(
                                        campaign.dueAt,
                                    ).toLocaleDateString("vi-VN")}
                                    {campaign.requiredEvidence
                                        ? " · Yêu cầu minh chứng"
                                        : ""}
                                </Text>
                                <Box mt={3}>
                                    <Button
                                        fullWidth
                                        onClick={() =>
                                            navigate(
                                                `/inspections/self-declarations/${target._id}`,
                                                { animate: true },
                                            )
                                        }
                                    >
                                        {status === "SENT" ||
                                        status === "DRAFT" ||
                                        status === "REQUEST_REVISION"
                                            ? "Mở biểu mẫu"
                                            : "Xem biểu mẫu"}
                                    </Button>
                                </Box>
                            </Box>
                        );
                    })}
            </Box>
        </PageLayout>
    );
};

export default InspectionSelfDeclarationListPage;
