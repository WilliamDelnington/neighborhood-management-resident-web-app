import React, { useEffect, useState } from "react";
import { Box, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth, hasPermission } from "@components/role";
import { useStore } from "@store";
import { fetchCorrespondences } from "@service/correspondenceApi";
import { Correspondence, CorrespondenceType } from "@dts";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<Correspondence["status"], string> = {
    nhap: "Nháp",
    da_gui: "Đã gửi",
};

const typeLabel = (doc: Correspondence): string => {
    const type = doc.correspondenceTypeId;
    return typeof type === "string" ? "" : (type as CorrespondenceType).name;
};

const CorrespondenceListPage: React.FC = () => (
    <RequireAuth>
        <CorrespondenceListContent />
    </RequireAuth>
);

/**
 * Danh sach van ban DA NHAN (Cong van tu can bo UBND/bi thu, hoac Bao
 * cao/De xuat tu to truong khac neu vai tro cua minh nam trong
 * allowedReceiverRoles cua loai van ban do) - xem correspondenceApi.fetchCorrespondences
 * (luon view="received" tren Mini App). Soan van bao gom ca hai buoc
 * tao+gui trong composeAndSendCorrespondence, xem CorrespondenceComposePage.
 */
const CorrespondenceListContent: React.FC = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const canCompose = hasPermission(user, "correspondences.create");

    const [items, setItems] = useState<Correspondence[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchCorrespondences(targetPage, PAGE_SIZE)
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

    return (
        <PageLayout
            id="correspondences-page"
            title="Văn bản"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {canCompose && (
                    <Box mb={3}>
                        <Button
                            fullWidth
                            onClick={() =>
                                navigate("/correspondences/compose", {
                                    animate: true,
                                })
                            }
                        >
                            Soạn văn bản
                        </Button>
                    </Box>
                )}
                {loading && <LoadingState />}
                {!loading && error && (
                    <ErrorState onRetry={() => load(1, false)} />
                )}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Chưa có văn bản nào" />
                )}
                {!loading && !error && items.length > 0 && (
                    <Box className="bg-white rounded-2xl p-2 shadow-sm">
                        {items.map(item => (
                            <ListRow
                                key={item._id}
                                title={item.title}
                                subtitle={
                                    item.documentNumber || typeLabel(item)
                                }
                                right={
                                    <StatusBadge
                                        label={STATUS_LABEL[item.status]}
                                        tone={
                                            item.status === "da_gui"
                                                ? "green"
                                                : "gray"
                                        }
                                    />
                                }
                                onClick={() =>
                                    navigate(`/correspondences/${item._id}`, {
                                        animate: true,
                                    })
                                }
                            />
                        ))}
                    </Box>
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
        </PageLayout>
    );
};

export default CorrespondenceListPage;
