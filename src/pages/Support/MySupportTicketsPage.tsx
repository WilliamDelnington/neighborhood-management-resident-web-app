import React, { useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { Box, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth } from "@components/role";
import { fetchMySupportTickets } from "@service/supportTicketApi";
import {
    LOAI_YEU_CAU_HO_TRO_LABEL,
    TRANG_THAI_YEU_CAU_HO_TRO_LABEL,
    TRANG_THAI_YEU_CAU_HO_TRO_TONE,
} from "@constants/domain";
import { SupportTicket } from "@dts";

const PAGE_SIZE = 20;

const MySupportTicketsPage: React.FC = () => (
    <RequireAuth>
        <MySupportTicketsContent />
    </RequireAuth>
);

/**
 * Lich su yeu cau ho tro CUA CHINH MINH - truoc day chi xem duoc tung yeu cau
 * qua man hinh thanh cong ngay sau khi tao (khong co danh sach), xem
 * fetchMySupportTickets da co san trong supportTicketApi.ts nhung chua duoc
 * dung o dau ca.
 */
const MySupportTicketsContent: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<SupportTicket[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchMySupportTickets(targetPage, PAGE_SIZE)
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
    }, []);

    return (
        <PageLayout
            id="my-support-tickets-page"
            title="Yêu cầu hỗ trợ của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && (
                    <ErrorState onRetry={() => load(1, false)} />
                )}
                {!loading && !error && items.length === 0 && (
                    <EmptyState
                        label="Bạn chưa gửi yêu cầu hỗ trợ nào"
                        icon={LifeBuoy}
                        tone="danger"
                    />
                )}
                {!loading &&
                    !error &&
                    items.map(item => (
                        <Box
                            key={item._id}
                            className="bg-white rounded-2xl p-4 shadow-card mt-3"
                            onClick={() =>
                                navigate(`/support/tickets/${item._id}`, {
                                    animate: true,
                                })
                            }
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Text size="small" className="font-medium">
                                        {item.title}
                                    </Text>
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        {LOAI_YEU_CAU_HO_TRO_LABEL[item.type]}
                                        {" · "}
                                        {item.code}
                                    </Text>
                                </Box>
                                <StatusBadge
                                    label={
                                        TRANG_THAI_YEU_CAU_HO_TRO_LABEL[
                                            item.status
                                        ]
                                    }
                                    tone={
                                        TRANG_THAI_YEU_CAU_HO_TRO_TONE[
                                            item.status
                                        ]
                                    }
                                />
                            </Box>
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

export default MySupportTicketsPage;
