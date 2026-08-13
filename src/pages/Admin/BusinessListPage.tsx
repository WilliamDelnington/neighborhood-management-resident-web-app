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
import { HousePickerSheet } from "@components/house";
import {
    BusinessForm,
    EMPTY_BUSINESS_FORM,
    BusinessFormValues,
    isBusinessFormValid,
    toBusinessInput,
} from "@components/business";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
} from "@constants/domain";
import { createBusiness, fetchBusinesses } from "@service/businessApi";
import { AppError, Business, House } from "@dts";

const PAGE_SIZE = 20;

const BusinessListPage: React.FC = () => (
    <RequireAuth>
        <BusinessListContent />
    </RequireAuth>
);

const BusinessListContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "businesses.read");
    const canCreate = hasPermission(user, "businesses.create");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Business[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const [createVisible, setCreateVisible] = useState(false);
    const [housePickerVisible, setHousePickerVisible] = useState(false);
    const [houseId, setHouseId] = useState("");
    const [houseLabel, setHouseLabel] = useState("");
    const [form, setForm] = useState<BusinessFormValues>(EMPTY_BUSINESS_FORM);
    const [submitting, setSubmitting] = useState(false);

    const load = (targetPage: number, searchValue: string, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchBusinesses({
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
                id="business-list-denied"
                title="Danh sách hộ kinh doanh"
            >
                <Box p={6}>
                    <Text size="small" className="text-text_2 text-center">
                        Tài khoản của bạn không có quyền xem danh sách hộ kinh
                        doanh.
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
        setHouseId("");
        setHouseLabel("");
        setForm(EMPTY_BUSINESS_FORM);
        setCreateVisible(true);
    };

    const handleSelectHouse = (house: House) => {
        setHouseId(house._id);
        setHouseLabel(`${house.code} — ${house.address}`);
    };

    const handleCreate = async () => {
        if (!houseId) {
            openSnackbar({ type: "error", text: "Vui lòng chọn nhà số" });
            return;
        }
        if (!isBusinessFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên hộ kinh doanh",
            });
            return;
        }
        try {
            setSubmitting(true);
            await createBusiness(toBusinessInput(form, houseId));
            openSnackbar({
                type: "success",
                text: "Đã thêm hộ kinh doanh mới",
            });
            setCreateVisible(false);
            load(1, search, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout id="business-list-page" title="Danh sách hộ kinh doanh">
            <Box p={4}>
                <Box className="bg-white rounded-2xl p-4 shadow-sm">
                    <Input
                        placeholder="Tìm theo tên hộ kinh doanh"
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
                        <EmptyState label="Không tìm thấy hộ kinh doanh nào" />
                    )}
                    {!loading && !error && items.length > 0 && (
                        <Box px={4}>
                            <Text size="xxSmall" className="text-text_2 py-2">
                                {total} hộ kinh doanh
                            </Text>
                            {items.map(item => {
                                const house =
                                    typeof item.houseId === "string"
                                        ? undefined
                                        : item.houseId;
                                const businessType =
                                    typeof item.businessType === "string" ||
                                    !item.businessType
                                        ? undefined
                                        : item.businessType;
                                const subtitleParts = [
                                    businessType?.name,
                                    house ? `Nhà ${house.code}` : undefined,
                                    item.ownerName,
                                ].filter(Boolean);
                                return (
                                    <ListRow
                                        key={item._id}
                                        title={item.name}
                                        subtitle={
                                            subtitleParts.join(" · ") ||
                                            undefined
                                        }
                                        right={
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
                                        }
                                        onClick={() =>
                                            navigate(
                                                `/admin/businesses/${item._id}`,
                                                { animate: true },
                                            )
                                        }
                                    />
                                );
                            })}
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
                title="Thêm hộ kinh doanh"
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
                        <Box mb={4}>
                            <Text size="xSmall" className="text-text_2 mb-1">
                                Nhà số
                            </Text>
                            <Box
                                className="bg-ng_10 rounded-lg px-3 py-2"
                                onClick={() => setHousePickerVisible(true)}
                            >
                                <Text
                                    size="small"
                                    className={houseId ? "" : "text-text_3"}
                                >
                                    {houseId ? houseLabel : "Chọn nhà số..."}
                                </Text>
                            </Box>
                        </Box>
                        <BusinessForm values={form} onChange={setForm} />
                    </Box>
                    <Box mt={3}>
                        <Button
                            fullWidth
                            loading={submitting}
                            onClick={handleCreate}
                        >
                            Lưu hộ kinh doanh
                        </Button>
                    </Box>
                </Box>
            </Sheet>

            <HousePickerSheet
                visible={housePickerVisible}
                status={["unverified", "pending", "verified"]}
                onClose={() => setHousePickerVisible(false)}
                onSelect={handleSelectHouse}
            />
        </PageLayout>
    );
};

export default BusinessListPage;
