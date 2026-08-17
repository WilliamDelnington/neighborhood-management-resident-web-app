import React, { useEffect, useState } from "react";
import {
    Box,
    Modal,
    Sheet,
    Text,
    useNavigate,
    useParams,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { Button } from "@components/customized";
import { RequireAuth, hasPermission } from "@components/role";
import {
    HouseholdForm,
    HouseholdFormValues,
    isHouseholdFormValid,
    toHouseholdInput,
} from "@components/household";
import {
    CitizenForm,
    EMPTY_CITIZEN_FORM,
    CitizenFormValues,
    isCitizenFormValid,
    toCitizenInput,
} from "@components/citizen";
import RequiredDocumentsPanel from "@components/documents/RequiredDocumentsPanel";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
    LOAI_SO_HUU_LABEL,
} from "@constants/domain";
import {
    AppError,
    Citizen,
    House,
    Household,
    RequiredDocumentItem,
    VerificationStatus,
} from "@dts";
import {
    deleteHousehold,
    fetchHouseholdById,
    fetchHouseholdCitizens,
    fetchHouseholdRequiredDocuments,
    reviewHouseholdDocument,
    submitHouseholdDocument,
    updateHousehold,
    updateHouseholdStatus,
} from "@service/householdApi";
import { createCitizen } from "@service/citizenApi";
import { fetchOrganizationById } from "@service/organizationApi";

const ownerIdOfHouse = (household: Household): string | undefined => {
    if (!household.houseId || typeof household.houseId === "string") {
        return undefined;
    }
    const { ownerId } = household.houseId;
    return typeof ownerId === "string" ? ownerId : ownerId?._id;
};

const ownerTypeOfHouse = (household: Household) =>
    typeof household.houseId === "string"
        ? undefined
        : household.houseId?.ownerType;

const toFormValues = (h: Household): HouseholdFormValues => {
    const house =
        typeof h.houseId === "object" ? (h.houseId as House) : undefined;
    return {
        cluster: h.cluster,
        address: h.address,
        headOfHousehold: h.headOfHousehold,
        phone: h.phone || "",
        memberCount: h.memberCount ? String(h.memberCount) : "",
        ownershipType: h.ownershipType,
        needsSupport: h.needsSupport,
        houseId: typeof h.houseId === "string" ? h.houseId : house?._id || "",
        houseLabel: house ? `${house.code} — ${house.address}` : "",
        note: h.note || "",
        attachments: [],
    };
};

const HouseholdDetailPage: React.FC = () => (
    <RequireAuth>
        <HouseholdDetailContent />
    </RequireAuth>
);

const HouseholdDetailContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const isAdmin = !!user?.roles.includes("admin");
    const canUpdate = hasPermission(user, "households.update");
    const canDelete = hasPermission(user, "households.delete");
    const canVerify = hasPermission(user, "households.verify");
    const canViewCitizens = hasPermission(user, "citizens.read");
    const canCreateCitizen = hasPermission(user, "citizens.create");

    const [household, setHousehold] = useState<Household | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [citizensLoading, setCitizensLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<HouseholdFormValues | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    const [isOwner, setIsOwner] = useState(false);
    useEffect(() => {
        const ownerId = household ? ownerIdOfHouse(household) : undefined;
        if (!user || !household || !ownerId) {
            setIsOwner(false);
            return;
        }
        if (ownerTypeOfHouse(household) !== "organization") {
            setIsOwner(ownerId === user.id);
            return;
        }
        let cancelled = false;
        fetchOrganizationById(ownerId)
            .then(org => {
                if (cancelled) return;
                const representativeId =
                    typeof org.representativeUserId === "string"
                        ? org.representativeUserId
                        : org.representativeUserId._id;
                setIsOwner(representativeId === user.id);
            })
            .catch(() => {
                if (!cancelled) setIsOwner(false);
            });
        // eslint-disable-next-line consistent-return
        return () => {
            cancelled = true;
        };
    }, [household, user]);

    const [citizenSheetVisible, setCitizenSheetVisible] = useState(false);
    const [citizenForm, setCitizenForm] =
        useState<CitizenFormValues>(EMPTY_CITIZEN_FORM);
    const [citizenSubmitting, setCitizenSubmitting] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setError(false);
        fetchHouseholdById(id)
            .then(h => {
                setHousehold(h);
                setForm(toFormValues(h));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    const loadCitizens = () => {
        if (!id || !canViewCitizens) {
            setCitizensLoading(false);
            return;
        }
        setCitizensLoading(true);
        fetchHouseholdCitizens(id)
            .then(res => setCitizens(res.items))
            .catch(() => setCitizens([]))
            .finally(() => setCitizensLoading(false));
    };

    useEffect(() => {
        load();
        loadCitizens();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!id) return null;

    const handleSave = async () => {
        if (!form) return;
        if (!isHouseholdFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn nhà số và nhập đầy đủ địa chỉ, chủ hộ",
            });
            return;
        }
        try {
            setSaving(true);
            const updated = await updateHousehold(id, toHouseholdInput(form));
            setHousehold(updated);
            setForm(toFormValues(updated));
            setEditing(false);
            openSnackbar({ type: "success", text: "Đã cập nhật hộ dân" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteHousehold(id);
            openSnackbar({ type: "success", text: "Đã xóa hộ dân" });
            navigate("/admin/households", { animate: true });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleStatusChange = async (target: VerificationStatus) => {
        try {
            setStatusSubmitting(true);
            const updated = await updateHouseholdStatus(id, target);
            setHousehold(updated);
            setForm(toFormValues(updated));
            openSnackbar({ type: "success", text: "Đã cập nhật trạng thái" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setStatusSubmitting(false);
        }
    };

    const openCreateCitizen = () => {
        setCitizenForm({
            ...EMPTY_CITIZEN_FORM,
            householdId: id,
            householdLabel: household
                ? `${household.code} — ${household.address}`
                : "",
        });
        setCitizenSheetVisible(true);
    };

    const handleCreateCitizen = async () => {
        if (!isCitizenFormValid(citizenForm)) {
            openSnackbar({ type: "error", text: "Vui lòng nhập họ tên" });
            return;
        }
        try {
            setCitizenSubmitting(true);
            await createCitizen(toCitizenInput(citizenForm));
            openSnackbar({ type: "success", text: "Đã thêm nhân khẩu" });
            setCitizenSheetVisible(false);
            loadCitizens();
            load();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setCitizenSubmitting(false);
        }
    };

    const statusActions: {
        label: string;
        target: VerificationStatus;
        danger?: boolean;
    }[] = [];
    if (household) {
        if (isAdmin) {
            (Object.keys(VERIFICATION_STATUS_LABEL) as VerificationStatus[])
                .filter(s => s !== household.status)
                .forEach(s =>
                    statusActions.push({
                        label: VERIFICATION_STATUS_LABEL[s],
                        target: s,
                        danger: s === "denied" || s === "locked",
                    }),
                );
        } else if (household.status !== "locked") {
            if (
                isOwner &&
                (household.status === "unverified" ||
                    household.status === "denied")
            ) {
                statusActions.push({ label: "Gửi duyệt", target: "pending" });
            }
            if (!isOwner && canVerify && household.status === "pending") {
                statusActions.push({ label: "Duyệt", target: "verified" });
                statusActions.push({
                    label: "Từ chối",
                    target: "denied",
                    danger: true,
                });
            }
        }
    }

    const canReviewHouseholdDocument = (
        item: RequiredDocumentItem,
    ): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        if (item.rule.reviewerRoles.length > 0) {
            return item.rule.reviewerRoles.some(r =>
                user.roles.includes(r as typeof user.roles[number]),
            );
        }
        return canVerify;
    };

    const canEditNow =
        canUpdate &&
        !!household &&
        ["unverified", "pending"].includes(household.status);

    return (
        <PageLayout id="admin-household-detail" title="Chi tiết hộ dân">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}

                {!loading && !error && household && form && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Text.Title size="small">
                                    {household.code}
                                </Text.Title>
                                <Box flex style={{ gap: 8 }}>
                                    <StatusBadge
                                        label={
                                            VERIFICATION_STATUS_LABEL[
                                                household.status
                                            ]
                                        }
                                        tone={
                                            VERIFICATION_STATUS_TONE[
                                                household.status
                                            ]
                                        }
                                    />
                                    {household.needsSupport && (
                                        <StatusBadge
                                            label="Cần hỗ trợ"
                                            tone="yellow"
                                        />
                                    )}
                                </Box>
                            </Box>

                            {editing ? (
                                <>
                                    <HouseholdForm
                                        values={form}
                                        onChange={setForm}
                                        showAttachments={false}
                                    />
                                    <Box mt={4} flex style={{ gap: 8 }}>
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            onClick={() => {
                                                setForm(
                                                    toFormValues(household),
                                                );
                                                setEditing(false);
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            fullWidth
                                            loading={saving}
                                            onClick={handleSave}
                                        >
                                            Lưu
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <InfoRow
                                        label="Cụm dân cư"
                                        value={household.cluster}
                                    />
                                    <InfoRow
                                        label="Địa chỉ"
                                        value={household.address}
                                    />
                                    <InfoRow
                                        label="Chủ hộ"
                                        value={household.headOfHousehold}
                                    />
                                    <InfoRow
                                        label="Số điện thoại"
                                        value={
                                            household.phone || "Chưa cập nhật"
                                        }
                                    />
                                    <InfoRow
                                        label="Số nhân khẩu"
                                        value={String(
                                            household.memberCount ?? 0,
                                        )}
                                    />
                                    <InfoRow
                                        label="Hình thức lưu trú"
                                        value={
                                            LOAI_SO_HUU_LABEL[
                                                household.ownershipType
                                            ]
                                        }
                                    />
                                    <InfoRow
                                        label="Nhà số liên kết"
                                        value={
                                            form.houseId
                                                ? form.houseLabel
                                                : "Chưa liên kết"
                                        }
                                    />
                                    <InfoRow
                                        label="Ghi chú"
                                        value={household.note || "Không có"}
                                    />

                                    {statusActions.length > 0 && (
                                        <Box
                                            mt={3}
                                            flex
                                            style={{ gap: 8, flexWrap: "wrap" }}
                                        >
                                            {statusActions.map(action => (
                                                <Button
                                                    key={action.target}
                                                    className={
                                                        action.danger
                                                            ? "!bg-red-500"
                                                            : undefined
                                                    }
                                                    loading={statusSubmitting}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            action.target,
                                                        )
                                                    }
                                                >
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </Box>
                                    )}

                                    {(canEditNow || canDelete) && (
                                        <Box mt={4} flex style={{ gap: 8 }}>
                                            {canEditNow && (
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    onClick={() =>
                                                        setEditing(true)
                                                    }
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    fullWidth
                                                    className="!bg-red-500"
                                                    onClick={() =>
                                                        setConfirmDelete(true)
                                                    }
                                                >
                                                    Xóa
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>

                        <RequiredDocumentsPanel
                            entityId={id}
                            relatedModel="HouseholdDocument"
                            fetchItems={fetchHouseholdRequiredDocuments}
                            onSubmit={submitHouseholdDocument}
                            onReview={reviewHouseholdDocument}
                            canSubmit={
                                isAdmin ||
                                (isOwner &&
                                    ["unverified", "pending"].includes(
                                        household.status,
                                    ))
                            }
                            canReview={canReviewHouseholdDocument}
                            onChanged={load}
                        />

                        {canViewCitizens && (
                            <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Text.Title size="small">
                                        Nhân khẩu trong hộ
                                    </Text.Title>
                                    {canCreateCitizen && (
                                        <Text
                                            size="xSmall"
                                            className="text-main"
                                            onClick={openCreateCitizen}
                                        >
                                            + Thêm
                                        </Text>
                                    )}
                                </Box>
                                {citizensLoading && <LoadingState />}
                                {!citizensLoading && citizens.length === 0 && (
                                    <EmptyState label="Chưa có nhân khẩu nào trong hộ" />
                                )}
                                {!citizensLoading &&
                                    citizens.map(c => (
                                        <ListRow
                                            key={c._id}
                                            title={c.fullName}
                                            subtitle={
                                                c.cccd ||
                                                c.phone ||
                                                c.relationToHead
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/admin/citizens/${c._id}`,
                                                    { animate: true },
                                                )
                                            }
                                        />
                                    ))}
                            </Box>
                        )}
                    </>
                )}
            </Box>

            <Modal
                visible={confirmDelete}
                title="Xóa hộ dân?"
                description={`Bạn có chắc muốn xóa hộ ${
                    household?.code || ""
                }? Hành động này không thể hoàn tác.`}
                onClose={() => setConfirmDelete(false)}
                actions={[
                    {
                        text: "Hủy",
                        close: true,
                        onClick: () => setConfirmDelete(false),
                    },
                    {
                        text: "Xóa",
                        danger: true,
                        onClick: handleDelete,
                        disabled: deleting,
                    },
                ]}
            />

            <Sheet
                visible={citizenSheetVisible}
                onClose={() => setCitizenSheetVisible(false)}
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
                        <CitizenForm
                            values={citizenForm}
                            onChange={setCitizenForm}
                            lockHousehold
                        />
                    </Box>
                    <Box mt={3}>
                        <Button
                            fullWidth
                            loading={citizenSubmitting}
                            onClick={handleCreateCitizen}
                        >
                            Lưu nhân khẩu
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </PageLayout>
    );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
    label,
    value,
}) => (
    <Box
        flex
        justifyContent="space-between"
        py={2}
        className="border-b border-divider_01 last:border-0"
    >
        <Text size="xSmall" className="text-text_2">
            {label}
        </Text>
        <Text size="xSmall" className="text-right">
            {value}
        </Text>
    </Box>
);

export default HouseholdDetailPage;
