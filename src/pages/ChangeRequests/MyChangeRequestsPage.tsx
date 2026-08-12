import React, { useEffect, useState } from "react";
import { Box, Text, useSnackbar } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth } from "@components/role";
import {
    cancelChangeRequest,
    fetchMyChangeRequests,
} from "@service/changeRequestApi";
import {
    AppError,
    ChangeRequest,
    ChangeRequestStatus,
    ChangeRequestTargetModel,
    ChangeRequestType,
} from "@dts";

const PAGE_SIZE = 20;

const TARGET_MODEL_LABEL: Record<ChangeRequestTargetModel, string> = {
    HouseRecord: "Nhà số",
    HouseOwnership: "Quan hệ sở hữu nhà",
    User: "Tài khoản",
};

const CHANGE_TYPE_LABEL: Record<ChangeRequestType, string> = {
    update: "Cập nhật thông tin",
    unlink: "Hủy liên kết",
};

const STATUS_LABEL: Record<ChangeRequestStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
};

const STATUS_TONE: Record<
    ChangeRequestStatus,
    "green" | "gray" | "red" | "yellow"
> = {
    pending: "yellow",
    approved: "green",
    rejected: "red",
    cancelled: "gray",
};

const MyChangeRequestsPage: React.FC = () => (
    <RequireAuth>
        <MyChangeRequestsContent />
    </RequireAuth>
);

/**
 * Lich su + trang thai cac yeu cau thay doi CUA CHINH MINH (nha, huy lien
 * ket, doi ten...) - danh sach nay CHINH LA lich su chinh sua, khong can man
 * "lich su" rieng (xem changeRequestService.ts o backend: mot ChangeRequest
 * da duyet/tu choi la mot ban ghi lich su).
 */
const MyChangeRequestsContent: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const [items, setItems] = useState<ChangeRequest[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchMyChangeRequests(targetPage, PAGE_SIZE)
            .then(res => {
                setItems(prev =>
                    append ? [...prev, ...res.items] : res.items,
                );
                setPage(res.page);
                setTotalPages(res.totalPages);
            })
            .catch(() => setError(true))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    useEffect(() => {
        load(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancel = async (id: string) => {
        try {
            setCancellingId(id);
            await cancelChangeRequest(id);
            openSnackbar({ type: "success", text: "Đã hủy yêu cầu" });
            load(1, false);
        } catch (err) {
            openSnackbar({
                type: "error",
                text: (err as AppError).message,
            });
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <PageLayout
            id="my-change-requests-page"
            title="Yêu cầu thay đổi thông tin của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && (
                    <ErrorState onRetry={() => load(1, false)} />
                )}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Bạn chưa gửi yêu cầu thay đổi thông tin nào" />
                )}
                {!loading &&
                    !error &&
                    items.map(item => (
                        <Box
                            key={item._id}
                            className="bg-white rounded-2xl p-4 shadow-sm mt-3"
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Text size="small" className="font-medium">
                                        {TARGET_MODEL_LABEL[item.targetModel]}
                                        {" · "}
                                        {CHANGE_TYPE_LABEL[item.changeType]}
                                    </Text>
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        {new Date(
                                            item.createdAt,
                                        ).toLocaleString("vi-VN")}
                                    </Text>
                                </Box>
                                <StatusBadge
                                    label={STATUS_LABEL[item.status]}
                                    tone={STATUS_TONE[item.status]}
                                />
                            </Box>

                            {item.decisionNote && (
                                <Text size="xSmall" className="mt-2">
                                    Ghi chú: {item.decisionNote}
                                </Text>
                            )}

                            {item.status === "pending" && (
                                <Box mt={3}>
                                    <Button
                                        fullWidth
                                        variant="secondary"
                                        loading={cancellingId === item._id}
                                        onClick={() => handleCancel(item._id)}
                                    >
                                        Hủy yêu cầu
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ))}
                {!loading && !error && page < totalPages && (
                    <Box mt={3}>
                        <Button
                            fullWidth
                            variant="secondary"
                            loading={loadingMore}
                            onClick={() => load(page + 1, true)}
                        >
                            Xem thêm
                        </Button>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default MyChangeRequestsPage;
