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
    CompanyForm,
    CompanyFormValues,
    isCompanyFormValid,
    toCompanyInput,
} from "@components/company";
import { AttachmentUploader } from "@components/attachments";
import RequiredDocumentsPanel from "@components/documents/RequiredDocumentsPanel";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
} from "@constants/domain";
import {
    AppError,
    Company,
    House,
    RequiredDocumentItem,
    VerificationStatus,
} from "@dts";
import {
    deleteCompany,
    fetchCompanyAttachments,
    fetchCompanyById,
    fetchCompanyRequiredDocuments,
    deleteCompanyAttachment,
    reviewCompanyDocument,
    submitCompanyDocument,
    updateCompany,
    updateCompanyStatus,
} from "@service/companyApi";
import { fetchOrganizationById } from "@service/organizationApi";

const toFormValues = (c: Company): CompanyFormValues => ({
    name: c.name,
    ownerName: c.ownerName || "",
    taxCode: c.taxCode || "",
    phone: c.phone || "",
    active: c.active,
    note: c.note || "",
    attachments: [],
});

const ownerIdOfHouse = (company: Company): string | undefined => {
    if (typeof company.houseId === "string") return undefined;
    const { ownerId } = company.houseId;
    return typeof ownerId === "string" ? ownerId : ownerId?._id;
};

const ownerTypeOfHouse = (company: Company) =>
    typeof company.houseId === "string" ? undefined : company.houseId.ownerType;

const houseIdOf = (company: Company): string =>
    typeof company.houseId === "string" ? company.houseId : company.houseId._id;

const CompanyDetailPage: React.FC = () => (
    <RequireAuth>
        <CompanyDetailContent />
    </RequireAuth>
);

const CompanyDetailContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);

    const isAdmin = !!user?.roles.includes("admin");
    const canUpdate = hasPermission(user, "companies.update");
    const canVerify = hasPermission(user, "companies.verify");
    const canDelete = hasPermission(user, "companies.delete");

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CompanyFormValues | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setError(false);
        fetchCompanyById(id)
            .then(c => {
                setCompany(c);
                setForm(toFormValues(c));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const [isOwner, setIsOwner] = useState(false);
    useEffect(() => {
        const ownerId = company ? ownerIdOfHouse(company) : undefined;
        if (!user || !company || !ownerId) {
            setIsOwner(false);
            return;
        }
        if (ownerTypeOfHouse(company) !== "organization") {
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
    }, [company, user]);

    if (!id) return null;

    const handleSave = async () => {
        if (!form || !company) return;
        if (!isCompanyFormValid(form)) {
            openSnackbar({ type: "error", text: "Vui lòng nhập tên công ty" });
            return;
        }
        try {
            setSaving(true);
            const updated = await updateCompany(
                id,
                toCompanyInput(form, houseIdOf(company)),
            );
            setCompany(updated);
            setForm(toFormValues(updated));
            setEditing(false);
            openSnackbar({ type: "success", text: "Đã cập nhật công ty" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteCompany(id);
            openSnackbar({ type: "success", text: "Đã xóa công ty" });
            navigate("/admin/companies", { animate: true });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    // Khac House/Household: khong co nhanh "canVerify duyet/tu choi" thu cong
    // cho staff - companyService.transitionCompanyStatus chi cho admin (bat ky
    // trang thai nao) hoac chu cong ty tu "denied" gui lai "pending", xem ghi
    // chu tren backend. Duyet tung giay to yeu cau (RequiredDocumentsPanel) la
    // hanh dong doc lap, van dung quyen companies.verify nhu binh thuong.
    const statusActions: {
        label: string;
        target: VerificationStatus;
        danger?: boolean;
    }[] = [];
    if (company) {
        if (isAdmin) {
            (Object.keys(VERIFICATION_STATUS_LABEL) as VerificationStatus[])
                .filter(s => s !== company.status)
                .forEach(s =>
                    statusActions.push({
                        label: VERIFICATION_STATUS_LABEL[s],
                        target: s,
                        danger: s === "denied" || s === "locked",
                    }),
                );
        } else if (isOwner && company.status === "denied") {
            statusActions.push({ label: "Gửi lại", target: "pending" });
        }
    }

    const handleStatusChange = async (target: VerificationStatus) => {
        try {
            setStatusSubmitting(true);
            const updated = await updateCompanyStatus(id, target);
            setCompany(updated);
            setForm(toFormValues(updated));
            openSnackbar({ type: "success", text: "Đã cập nhật trạng thái" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setStatusSubmitting(false);
        }
    };

    const canReviewCompanyDocument = (item: RequiredDocumentItem): boolean => {
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
        !!company &&
        ["unverified", "pending"].includes(company.status);

    const house: House | null =
        company && typeof company.houseId !== "string" ? company.houseId : null;

    return (
        <PageLayout id="admin-company-detail" title="Chi tiết công ty">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}

                {!loading && !error && company && form && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Text.Title size="small">
                                    {company.name}
                                </Text.Title>
                                <StatusBadge
                                    label={
                                        VERIFICATION_STATUS_LABEL[
                                            company.status
                                        ]
                                    }
                                    tone={
                                        VERIFICATION_STATUS_TONE[company.status]
                                    }
                                />
                            </Box>

                            {editing ? (
                                <>
                                    <CompanyForm
                                        values={form}
                                        onChange={setForm}
                                    />
                                    <Box mt={4} flex style={{ gap: 8 }}>
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            onClick={() => {
                                                setForm(toFormValues(company));
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
                                    {house && (
                                        <InfoRow
                                            label="Nhà số"
                                            value={`${house.code} — ${house.address}`}
                                        />
                                    )}
                                    <InfoRow
                                        label="Người đại diện"
                                        value={company.ownerName || "Không có"}
                                    />
                                    <InfoRow
                                        label="Mã số thuế"
                                        value={company.taxCode}
                                    />
                                    <InfoRow
                                        label="Số điện thoại"
                                        value={company.phone || "Chưa cập nhật"}
                                    />
                                    <InfoRow
                                        label="Trạng thái hoạt động"
                                        value={
                                            company.active
                                                ? "Đang hoạt động"
                                                : "Ngừng hoạt động"
                                        }
                                    />
                                    <InfoRow
                                        label="Ghi chú"
                                        value={company.note || "Không có"}
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

                        <AttachmentUploader
                            relatedModel="Company"
                            relatedId={id}
                            canUpload={isOwner || canUpdate || canVerify}
                            canDelete={canUpdate || canVerify}
                            fetchAttachments={fetchCompanyAttachments}
                            deleteAttachmentFn={deleteCompanyAttachment}
                        />

                        <RequiredDocumentsPanel
                            entityId={id}
                            relatedModel="CompanyDocument"
                            fetchItems={fetchCompanyRequiredDocuments}
                            onSubmit={submitCompanyDocument}
                            onReview={reviewCompanyDocument}
                            canSubmit={
                                isAdmin ||
                                (isOwner &&
                                    ["unverified", "pending"].includes(
                                        company.status,
                                    ))
                            }
                            canReview={canReviewCompanyDocument}
                            onChanged={load}
                        />
                    </>
                )}
            </Box>

            <Modal
                visible={confirmDelete}
                title="Xóa công ty?"
                description={`Bạn có chắc muốn xóa công ty ${
                    company?.name || ""
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

export default CompanyDetailPage;
