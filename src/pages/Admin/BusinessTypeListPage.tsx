import React, { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import { Box, Icon, Sheet, Text, useSnackbar } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
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
    BusinessTypeForm,
    EMPTY_BUSINESS_TYPE_FORM,
    BusinessTypeFormValues,
    isBusinessTypeFormValid,
    toBusinessTypeInput,
} from "@components/businessType";
import { useStore } from "@store";
import {
    createBusinessType,
    deleteBusinessType,
    fetchBusinessTypes,
    updateBusinessType,
} from "@service/businessTypeApi";
import { AppError, BusinessType } from "@dts";

const PAGE_SIZE = 20;

const toFormValues = (bt: BusinessType): BusinessTypeFormValues => ({
    name: bt.name,
    description: bt.description || "",
    active: bt.active,
    sortOrder: String(bt.sortOrder ?? ""),
});

const BusinessTypeListPage: React.FC = () => (
    <RequireAuth>
        <BusinessTypeListContent />
    </RequireAuth>
);

const BusinessTypeListContent: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "business_types.read");
    const canCreate = hasPermission(user, "business_types.create");
    const canUpdate = hasPermission(user, "business_types.update");
    const canDelete = hasPermission(user, "business_types.delete");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<BusinessType[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const [sheetVisible, setSheetVisible] = useState(false);
    const [editing, setEditing] = useState<BusinessType | null>(null);
    const [form, setForm] = useState<BusinessTypeFormValues>(
        EMPTY_BUSINESS_TYPE_FORM,
    );
    const [submitting, setSubmitting] = useState(false);

    const load = (targetPage: number, searchValue: string, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchBusinessTypes({
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
            <PageLayout
                id="business-type-list-denied"
                title="Loại hình kinh doanh"
            >
                <Box p={6}>
                    <Text size="small" className="text-text_2 text-center">
                        Tài khoản của bạn không có quyền xem danh mục này.
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
        setEditing(null);
        setForm(EMPTY_BUSINESS_TYPE_FORM);
        setSheetVisible(true);
    };

    const openEdit = (bt: BusinessType) => {
        setEditing(bt);
        setForm(toFormValues(bt));
        setSheetVisible(true);
    };

    const handleSave = async () => {
        if (!isBusinessTypeFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên loại hình",
            });
            return;
        }
        try {
            setSubmitting(true);
            if (editing) {
                await updateBusinessType(
                    editing._id,
                    toBusinessTypeInput(form),
                );
                openSnackbar({
                    type: "success",
                    text: "Đã cập nhật loại hình",
                });
            } else {
                await createBusinessType(toBusinessTypeInput(form));
                openSnackbar({
                    type: "success",
                    text: "Đã thêm loại hình mới",
                });
            }
            setSheetVisible(false);
            load(1, search, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editing) return;
        try {
            setSubmitting(true);
            await deleteBusinessType(editing._id);
            openSnackbar({ type: "success", text: "Đã xóa loại hình" });
            setSheetVisible(false);
            load(1, search, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout
            id="business-type-list-page"
            title="Loại hình kinh doanh"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                <Box className="bg-white rounded-2xl p-4 shadow-card">
                    <Input
                        placeholder="Tìm theo tên loại hình"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    <Box mt={3}>
                        <Button fullWidth onClick={handleSearch}>
                            Tìm kiếm
                        </Button>
                    </Box>
                </Box>

                <Box className="bg-white rounded-2xl mt-3 shadow-card">
                    {loading && <LoadingState />}
                    {!loading && error && (
                        <ErrorState onRetry={() => load(1, search, false)} />
                    )}
                    {!loading && !error && items.length === 0 && (
                        <EmptyState
                            label="Chưa có loại hình kinh doanh nào"
                            icon={Tags}
                            tone="warning"
                        />
                    )}
                    {!loading && !error && items.length > 0 && (
                        <Box px={4}>
                            <Text size="xxSmall" className="text-text_2 py-2">
                                {total} loại hình
                            </Text>
                            {items.map(item => (
                                <ListRow
                                    key={item._id}
                                    title={item.name}
                                    subtitle={item.description}
                                    right={
                                        <StatusBadge
                                            label={
                                                item.active
                                                    ? "Hoạt động"
                                                    : "Vô hiệu"
                                            }
                                            tone={
                                                item.active ? "green" : "gray"
                                            }
                                        />
                                    }
                                    onClick={
                                        canUpdate
                                            ? () => openEdit(item)
                                            : undefined
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
                        boxShadow: "0 4px 12px rgba(5,170,192,0.4)",
                        zIndex: 20,
                    }}
                    onClick={openCreate}
                >
                    <Icon icon="zi-plus" className="text-white" />
                </Box>
            )}

            <Sheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                title={editing ? "Chỉnh sửa loại hình" : "Thêm loại hình"}
                height="70vh"
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
                        <BusinessTypeForm values={form} onChange={setForm} />
                    </Box>
                    <Box mt={3} flex style={{ gap: 8 }}>
                        {editing && canDelete && (
                            <Button
                                variant="secondary"
                                fullWidth
                                className="!bg-red-500 !text-white"
                                loading={submitting}
                                onClick={handleDelete}
                            >
                                Xóa
                            </Button>
                        )}
                        <Button
                            fullWidth
                            loading={submitting}
                            onClick={handleSave}
                        >
                            Lưu
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </PageLayout>
    );
};

export default BusinessTypeListPage;
