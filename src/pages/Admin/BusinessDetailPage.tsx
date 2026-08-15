import React, { useEffect, useState } from "react";
import {
    Box,
    Modal,
    Text,
    useNavigate,
    useParams,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
import { ErrorState, LoadingState, StatusBadge } from "@components/admin";
import { Button } from "@components/customized";
import { RequireAuth, hasPermission } from "@components/role";
import {
    BusinessForm,
    BusinessFormValues,
    isBusinessFormValid,
    toBusinessInput,
} from "@components/business";
import RequiredDocumentsPanel from "@components/documents/RequiredDocumentsPanel";
import { AttachmentUploader } from "@components/attachments";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
} from "@constants/domain";
import {
    AppError,
    Business,
    VerificationStatus,
    RequiredDocumentItem,
} from "@dts";
import {
    deleteBusiness,
    fetchBusinessAttachments,
    fetchBusinessById,
    fetchRequiredDocuments,
    deleteBusinessAttachment,
    reviewBusinessDocument,
    submitBusinessDocument,
    updateBusiness,
    updateBusinessStatus,
} from "@service/businessApi";
import { fetchOrganizationById } from "@service/organizationApi";

const VERIFICATION_STATUS_OVERRIDE_OPTIONS: VerificationStatus[] = [
    "unverified",
    "pending",
    "verified",
    "denied",
    "locked",
];

const toFormValues = (b: Business): BusinessFormValues => ({
    name: b.name,
    ownerName: b.ownerName || "",
    taxCode: b.taxCode || "",
    phone: b.phone || "",
    active: b.active,
    businessTypeId:
        b.businessType && typeof b.businessType === "object"
            ? b.businessType._id
            : b.businessType || "",
    businessTypeLabel:
        b.businessType && typeof b.businessType === "object"
            ? b.businessType.name
            : "",
    note: b.note || "",
    attachments: [],
});

const ownerIdOfHouse = (business: Business): string | undefined => {
    if (typeof business.houseId === "string") return undefined;
    const { ownerId } = business.houseId;
    return typeof ownerId === "string" ? ownerId : ownerId?._id;
};

const ownerTypeOfHouse = (business: Business) =>
    typeof business.houseId === "string"
        ? undefined
        : business.houseId.ownerType;

const houseIdOf = (business: Business): string =>
    typeof business.houseId === "string"
        ? business.houseId
        : business.houseId._id;

const BusinessDetailPage: React.FC = () => (
    <RequireAuth>
        <BusinessDetailContent />
    </RequireAuth>
);

const BusinessDetailContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);

    const isAdmin = !!user?.roles.includes("admin");
    const canUpdate = hasPermission(user, "businesses.update");
    const canVerify = hasPermission(user, "businesses.verify");
    const canDelete = hasPermission(user, "businesses.delete");

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<BusinessFormValues | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setError(false);
        fetchBusinessById(id)
            .then(b => {
                setBusiness(b);
                setForm(toFormValues(b));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const [isOwner, setIsOwner] = useState(false);
    useEffect(() => {
        const ownerId = business ? ownerIdOfHouse(business) : undefined;
        if (!user || !business || !ownerId) {
            setIsOwner(false);
            return;
        }
        if (ownerTypeOfHouse(business) !== "organization") {
            setIsOwner(ownerId === user.id);
            return;
        }
        // Nha cua ho kinh doanh nay thuoc mot to chuc - phai tra ve nguoi dai
        // dien cua to chuc do de so sanh, giong pattern o HouseDetailPage.tsx.
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
    }, [business, user]);

    if (!id) return null;

    const handleSave = async () => {
        if (!form) return;
        if (!isBusinessFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên hộ kinh doanh",
            });
            return;
        }
        try {
            setSaving(true);
            const updated = await updateBusiness(
                id,
                toBusinessInput(form, houseIdOf(business!)),
            );
            setBusiness(updated);
            setForm(toFormValues(updated));
            setEditing(false);
            openSnackbar({
                type: "success",
                text: "Đã cập nhật hộ kinh doanh",
            });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    // Ghi de thu cong - CHI admin duoc phep (xem PATCH /api/businesses/:id/status
    // o backend). Luong binh thuong (chu ho nop giay to, nguoi phu trach duyet
    // tung giay to) di qua RequiredDocumentsPanel, trang thai duoc backend tu
    // tinh lai - khong con nut "Gửi duyệt"/"Duyệt"/"Từ chối" thu cong nhu truoc.
    const handleOverrideStatus = async (target: VerificationStatus) => {
        try {
            setStatusSubmitting(true);
            const updated = await updateBusinessStatus(id, target);
            setBusiness(updated);
            setForm(toFormValues(updated));
            openSnackbar({ type: "success", text: "Đã ghi đè trạng thái" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setStatusSubmitting(false);
        }
    };

    const canReviewItem = (item: RequiredDocumentItem): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        if (item.rule.reviewerRoles.length > 0) {
            return item.rule.reviewerRoles.some(r =>
                user.roles.includes(r as typeof user.roles[number]),
            );
        }
        return canVerify;
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteBusiness(id);
            openSnackbar({ type: "success", text: "Đã xóa hộ kinh doanh" });
            navigate("/admin/businesses", { animate: true });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleResubmit = async () => {
        try {
            setResubmitting(true);
            const updated = await updateBusinessStatus(id, "pending");
            setBusiness(updated);
            setForm(toFormValues(updated));
            openSnackbar({
                type: "success",
                text: "Đã gửi lại hộ kinh doanh để duyệt",
            });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setResubmitting(false);
        }
    };

    const canEditNow =
        canUpdate &&
        !!business &&
        ["unverified", "pending"].includes(business.status);

    return (
        <PageLayout id="admin-business-detail" title="Chi tiết hộ kinh doanh">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}

                {!loading && !error && business && form && (
                    <Box className="bg-white rounded-2xl p-4 shadow-sm">
                        <Box
                            flex
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Text.Title size="small">
                                {business.name}
                            </Text.Title>
                            <Box flex style={{ gap: 8 }}>
                                <StatusBadge
                                    label={
                                        VERIFICATION_STATUS_LABEL[
                                            business.status
                                        ]
                                    }
                                    tone={
                                        VERIFICATION_STATUS_TONE[
                                            business.status
                                        ]
                                    }
                                />
                            </Box>
                        </Box>

                        {editing ? (
                            <>
                                <BusinessForm
                                    values={form}
                                    onChange={setForm}
                                    showAttachments={false}
                                />
                                <Box mt={4} flex style={{ gap: 8 }}>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            setForm(toFormValues(business));
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
                                    label="Chủ hộ kinh doanh"
                                    value={business.ownerName || "Không có"}
                                />
                                <InfoRow
                                    label="Số điện thoại"
                                    value={business.phone || "Không có"}
                                />
                                <InfoRow
                                    label="Trạng thái hoạt động"
                                    value={
                                        business.active
                                            ? "Hoạt động"
                                            : "Vô hiệu"
                                    }
                                />
                                <InfoRow
                                    label="Ghi chú"
                                    value={business.note || "Không có"}
                                />

                                {isAdmin && (
                                    <Box
                                        mt={3}
                                        pt={3}
                                        className="border-t border-divider_01"
                                    >
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 mb-1"
                                        >
                                            Ghi đè trạng thái (Admin)
                                        </Text>
                                        <Box
                                            flex
                                            style={{ gap: 8, flexWrap: "wrap" }}
                                        >
                                            {VERIFICATION_STATUS_OVERRIDE_OPTIONS.filter(
                                                s => s !== business.status,
                                            ).map(s => (
                                                <Button
                                                    key={s}
                                                    variant="secondary"
                                                    loading={statusSubmitting}
                                                    onClick={() =>
                                                        handleOverrideStatus(s)
                                                    }
                                                >
                                                    {
                                                        VERIFICATION_STATUS_LABEL[
                                                            s
                                                        ]
                                                    }
                                                </Button>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {(canEditNow ||
                                    canDelete ||
                                    (isOwner &&
                                        business.status === "denied")) && (
                                    <Box mt={4} flex style={{ gap: 8 }}>
                                        {canEditNow && (
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => setEditing(true)}
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
                                        {isOwner &&
                                            business.status === "denied" && (
                                                <Button
                                                    fullWidth
                                                    loading={resubmitting}
                                                    onClick={handleResubmit}
                                                >
                                                    Gửi lại
                                                </Button>
                                            )}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                )}

                {!loading && !error && business && (
                    <RequiredDocumentsPanel
                        entityId={id}
                        relatedModel="BusinessDocument"
                        fetchItems={fetchRequiredDocuments}
                        onSubmit={submitBusinessDocument}
                        onReview={reviewBusinessDocument}
                        canSubmit={
                            isAdmin ||
                            (isOwner &&
                                ["unverified", "pending"].includes(
                                    business.status,
                                ))
                        }
                        canReview={canReviewItem}
                        emptyLabel="Loại hình kinh doanh này chưa có yêu cầu giấy tờ nào"
                        onChanged={load}
                    />
                )}

                {!loading && !error && business && (
                    <AttachmentUploader
                        relatedModel="Business"
                        relatedId={id}
                        canUpload={isOwner || canUpdate || canVerify}
                        canDelete={canUpdate || canVerify}
                        fetchAttachments={fetchBusinessAttachments}
                        deleteAttachmentFn={deleteBusinessAttachment}
                    />
                )}
            </Box>

            <Modal
                visible={confirmDelete}
                title="Xóa hộ kinh doanh?"
                description={`Bạn có chắc muốn xóa ${
                    business?.name || ""
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

export default BusinessDetailPage;
