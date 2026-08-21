import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { Button } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { fetchComplaints } from "@service/complaintApi";
import {
    TRANG_THAI_PHAN_ANH_LABEL,
    TRANG_THAI_PHAN_ANH_TONE,
} from "@constants/domain";
import { Complaint } from "@dts";

const PAGE_SIZE = 20;

/**
 * Hop thu phan anh danh cho nhan vien (to truong, bi thu, cong an, can bo UBND...).
 * Chi hien khi tai khoan co quyen complaints.read (xem ComplaintLookupPage). Danh
 * sach da duoc backend gioi han theo cum phu trach / trang thai chuyen UBND, nen
 * component nay chi hien thi nguyen ket qua tra ve, khong loc them.
 */
const StaffComplaintInbox: React.FC = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState<Complaint[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchComplaints({ page: targetPage, limit: PAGE_SIZE })
            .then(res => {
                setItems(prev =>
                    append ? [...prev, ...res.items] : res.items,
                );
                setPage(res.page);
                setTotalPages(res.totalPages);
                setTotal(res.total);
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

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
            <Text.Title size="small" className="mb-2">
                Phản ánh trong phạm vi phụ trách
            </Text.Title>

            {loading && <LoadingState />}
            {!loading && error && <ErrorState onRetry={() => load(1, false)} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState label="Chưa có phản ánh nào trong phạm vi của bạn" />
            )}
            {!loading && !error && items.length > 0 && (
                <>
                    <Text size="xxSmall" className="text-text_2 py-2">
                        {total} phản ánh
                    </Text>
                    {items.map(item => (
                        <ListRow
                            key={item._id}
                            title={item.title}
                            subtitle={item.code}
                            right={
                                <StatusBadge
                                    label={
                                        TRANG_THAI_PHAN_ANH_LABEL[item.status]
                                    }
                                    tone={TRANG_THAI_PHAN_ANH_TONE[item.status]}
                                />
                            }
                            onClick={() =>
                                navigate(`/complaints/${item._id}`, {
                                    animate: true,
                                })
                            }
                        />
                    ))}
                </>
            )}

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
    );
};

export default StaffComplaintInbox;
