import React, { useEffect, useState } from "react";
import {
    Box,
    Icon,
    Sheet,
    Text,
    useNavigate,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth, hasPermission } from "@components/role";
import {
    HouseholdForm,
    EMPTY_HOUSEHOLD_FORM,
    HouseholdFormValues,
    isHouseholdFormValid,
    toHouseholdInput,
} from "@components/household";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
} from "@constants/domain";
import { createHousehold, fetchHouseholds } from "@service/householdApi";
import { AppError, Household } from "@dts";

const PAGE_SIZE = 20;

const HouseholdListPage: React.FC = () => (
    <RequireAuth>
        <HouseholdListContent />
    </RequireAuth>
);

const HouseholdListContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "households.read");
    const canCreate = hasPermission(user, "households.create");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Household[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const [createVisible, setCreateVisible] = useState(false);
    const [form, setForm] = useState<HouseholdFormValues>(EMPTY_HOUSEHOLD_FORM);
    const [submitting, setSubmitting] = useState(false);

    const load = (targetPage: number, searchValue: string, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchHouseholds({
            search: searchValue || undefined,
            page: targetPage,
            limit: PAGE_SIZE,
        })
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
        if (canView) load(1, "", false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canView]);

    if (!canView) {
        return (
            <PageLayout id="household-list-denied" title="Danh sách hộ dân">
                <Box p={6}>
                    <Text size="small" className="text-text_2 text-center">
                        Tài khoản của bạn không có quyền xem danh sách hộ dân.
                    </Text>
                </Box>
            </PageLayout>
        );
    }

    const handleSearch = () => {
        const value = searchInput.trim();
        setSearch(value);
        load(1, value, false);
    };

    const openCreate = () => {
        setForm(EMPTY_HOUSEHOLD_FORM);
        setCreateVisible(true);
    };

    const handleCreate = async () => {
        if (!isHouseholdFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn nhà số và nhập đầy đủ địa chỉ, chủ hộ",
            });
            return;
        }
        try {
            setSubmitting(true);
            await createHousehold(toHouseholdInput(form));
            openSnackbar({ type: "success", text: "Đã thêm hộ dân mới" });
            setCreateVisible(false);
            load(1, search, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout id="household-list-page" title="Danh sách hộ dân">
            <Box p={4}>
                <Box className="bg-white rounded-2xl p-4 shadow-sm">
                    <Input
                        placeholder="Tìm theo mã hộ, địa chỉ hoặc chủ hộ"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    <Box mt={3}>
                        <Button fullWidth onClick={handleSearch}>
                            Tìm kiếm
                        </Button>
                    </Box>
                </Box>

                <Box className="bg-white rounded-2xl mt-3 shadow-sm">
                    {loading && <LoadingState />}
                    {!loading && error && (
                        <ErrorState onRetry={() => load(1, search, false)} />
                    )}
                    {!loading && !error && items.length === 0 && (
                        <EmptyState label="Không tìm thấy hộ dân nào" />
                    )}
                    {!loading && !error && items.length > 0 && (
                        <Box px={4}>
                            <Text size="xxSmall" className="text-text_2 py-2">
                                {total} hộ dân
                            </Text>
                            {items.map(item => (
                                <ListRow
                                    key={item._id}
                                    title={`${item.code} · ${item.headOfHousehold}`}
                                    subtitle={`${item.address} · ${item.memberCount} nhân khẩu`}
                                    right={
                                        <>
                                            <StatusBadge
                                                label={
                                                    VERIFICATION_STATUS_LABEL[
                                                        item.status
                                                    ]
                                                }
                                                tone={
                                                    VERIFICATION_STATUS_TONE[
                                                        item.status
                                                    ]
                                                }
                                            />
                                            {item.needsSupport && (
                                                <StatusBadge
                                                    label="Cần hỗ trợ"
                                                    tone="yellow"
                                                />
                                            )}
                                        </>
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/admin/households/${item._id}`,
                                            { animate: true },
                                        )
                                    }
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {!loading && !error && page < totalPages && (
                    <Box mt={3}>
                        <Button
                            fullWidth
                            variant="secondary"
                            loading={loadingMore}
                            onClick={() => load(page + 1, search, true)}
                        >
                            Xem thêm
                        </Button>
                    </Box>
                )}
            </Box>

            {canCreate && (
                <Box
                    className="bg-main"
                    style={{
                        position: "fixed",
                        right: 16,
                        bottom: 76,
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                        zIndex: 20,
                    }}
                    onClick={openCreate}
                >
                    <Icon icon="zi-plus" className="text-white" />
                </Box>
            )}

            <Sheet
                visible={createVisible}
                onClose={() => setCreateVisible(false)}
                title="Thêm hộ dân"
                height="85vh"
                autoHeight={false}
            >
                <Box
                    p={4}
                    style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box style={{ flex: 1, overflowY: "auto" }}>
                        <HouseholdForm values={form} onChange={setForm} />
                    </Box>
                    <Box mt={3}>
                        <Button
                            fullWidth
                            loading={submitting}
                            onClick={handleCreate}
                        >
                            Lưu hộ dân
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </PageLayout>
    );
};

export default HouseholdListPage;
