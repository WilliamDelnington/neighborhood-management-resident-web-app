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
} from "@components/admin";
import { RequireAuth, hasPermission } from "@components/role";
import {
    CitizenForm,
    EMPTY_CITIZEN_FORM,
    CitizenFormValues,
    isCitizenFormValid,
    toCitizenInput,
} from "@components/citizen";
import { useStore } from "@store";
import { createCitizen, fetchCitizens } from "@service/citizenApi";
import { uploadPendingAttachments } from "@service/uploadApi";
import { GIOI_TINH_LABEL } from "@constants/domain";
import { AppError, Citizen } from "@dts";

const PAGE_SIZE = 20;

const CitizenListPage: React.FC = () => (
    <RequireAuth>
        <CitizenListContent />
    </RequireAuth>
);

const householdSubtitle = (citizen: Citizen): string => {
    const household = citizen.householdId;
    if (household && typeof household === "object") {
        return `Hộ ${household.code} · ${household.address}`;
    }
    return "";
};

const CitizenListContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "citizens.read");
    const canCreate = hasPermission(user, "citizens.create");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Citizen[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const [createVisible, setCreateVisible] = useState(false);
    const [form, setForm] = useState<CitizenFormValues>(EMPTY_CITIZEN_FORM);
    const [submitting, setSubmitting] = useState(false);

    const load = (targetPage: number, searchValue: string, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchCitizens({
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
            <PageLayout id="citizen-list-denied" title="Danh sách nhân khẩu">
                <Box p={6}>
                    <Text size="small" className="text-text_2 text-center">
                        Tài khoản của bạn không có quyền xem danh sách nhân
                        khẩu.
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
        setForm(EMPTY_CITIZEN_FORM);
        setCreateVisible(true);
    };

    const handleCreate = async () => {
        if (!isCitizenFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập họ tên và chọn hộ khẩu",
            });
            return;
        }
        try {
            setSubmitting(true);
            const citizen = await createCitizen(toCitizenInput(form));
            let text = "Đã thêm nhân khẩu mới";
            if (form.attachments.length > 0) {
                const { failed } = await uploadPendingAttachments(
                    "Citizen",
                    citizen._id,
                    form.attachments,
                );
                if (failed.length > 0) {
                    text = `${text}, nhưng ${failed.length} tài liệu tải lên thất bại`;
                }
            }
            openSnackbar({ type: "success", text });
            setCreateVisible(false);
            load(1, search, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout id="citizen-list-page" title="Danh sách nhân khẩu">
            <Box p={4}>
                <Box className="bg-white rounded-2xl p-4 shadow-sm">
                    <Input
                        placeholder="Tìm theo họ tên, CCCD hoặc SĐT"
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
                        <EmptyState label="Không tìm thấy nhân khẩu nào" />
                    )}
                    {!loading && !error && items.length > 0 && (
                        <Box px={4}>
                            <Text size="xxSmall" className="text-text_2 py-2">
                                {total} nhân khẩu
                            </Text>
                            {items.map(item => (
                                <ListRow
                                    key={item._id}
                                    title={`${item.fullName} · ${
                                        GIOI_TINH_LABEL[item.gender]
                                    }`}
                                    subtitle={[
                                        householdSubtitle(item),
                                        item.phone,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    onClick={() =>
                                        navigate(
                                            `/admin/citizens/${item._id}`,
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
                title="Thêm nhân khẩu"
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
                        <CitizenForm values={form} onChange={setForm} />
                    </Box>
                    <Box mt={3}>
                        <Button
                            fullWidth
                            loading={submitting}
                            onClick={handleCreate}
                        >
                            Lưu nhân khẩu
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </PageLayout>
    );
};

export default CitizenListPage;
