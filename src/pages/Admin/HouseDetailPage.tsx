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
    HouseForm,
    HouseFormValues,
    isHouseFormValid,
    toHouseInput,
} from "@components/house";
import {
    BusinessForm,
    EMPTY_BUSINESS_FORM,
    BusinessFormValues,
    isBusinessFormValid,
    toBusinessInput,
} from "@components/business";
import {
    HouseholdForm,
    EMPTY_HOUSEHOLD_FORM,
    HouseholdFormValues,
    isHouseholdFormValid,
    toHouseholdInput,
} from "@components/household";
import {
    CompanyForm,
    EMPTY_COMPANY_FORM,
    CompanyFormValues,
    isCompanyFormValid,
    toCompanyInput,
} from "@components/company";
import { AttachmentUploader } from "@components/attachments";
import RequiredDocumentsPanel from "@components/documents/RequiredDocumentsPanel";
import HouseOwnershipSection from "@components/house/HouseOwnershipSection";
import { useStore } from "@store";
import {
    VERIFICATION_STATUS_LABEL,
    VERIFICATION_STATUS_TONE,
    HOUSE_PHYSICAL_STATUS_LABEL,
    HOUSE_STATUS_LABEL,
    HOUSE_STATUS_TONE,
    HOUSE_USAGE_TYPE_LABEL,
} from "@constants/domain";
import {
    AppError,
    Business,
    Company,
    House,
    HouseStatus,
    Household,
    RequiredDocumentItem,
} from "@dts";
import {
    deleteHouse,
    fetchHouseAttachments,
    fetchHouseBusinesses,
    fetchHouseById,
    fetchHouseCompanies,
    fetchHouseHouseholds,
    fetchHouseRequiredDocuments,
    deleteHouseAttachment,
    reviewHouseDocument,
    submitHouseDocument,
    updateHouse,
    updateHouseStatus,
} from "@service/houseApi";
import { createBusiness } from "@service/businessApi";
import { createHousehold } from "@service/householdApi";
import { createCompany } from "@service/companyApi";
import { fetchOrganizationById } from "@service/organizationApi";
import { createChangeRequest } from "@service/changeRequestApi";
import { uploadPendingAttachments } from "@service/uploadApi";

// Truong "dinh danh/dia chi" cua nha so - mot khi nha da "verified", chu nha
// (khong phai nhan vien) phai gui ChangeRequest cho cac truong nay thay vi
// sua truc tiep (xem HOUSE_RECORD_PROTECTED_FIELDS trong houseRecordService.ts
// o backend - danh sach nay la ban rut gon, chi gom cac truong ma HouseForm
// cua Mini App nay thuc su co UI de sua).
const HOUSE_PROTECTED_FIELDS = [
    "address",
    "cluster",
    "streetId",
    "neighborhoodId",
    "usageTypes",
    "otherUsageNote",
] as const;

// gisSource "address_lookup"/"device_gps" anh xa thang ve geoMode tuong ung;
// cac nguon khac (manual/external_gis) nhung van co toa do duoc coi la
// "manual" trong form sua (nguoi dung co the giu nguyen hoac nhap lai); chua
// co toa do thi mac dinh "skip".
function resolveGeoMode(h: House): HouseFormValues["geoMode"] {
    if (h.gisSource === "address_lookup") return "address";
    if (h.gisSource === "device_gps") return "gps";
    if (h.gisLatitude != null && h.gisLongitude != null) return "manual";
    return "skip";
}

// Voi address/gps da co toa do san, coi nhu dong y (geoConsentAccepted=true)
// da duoc ghi nhan tu luc tao/sua truoc do - khong bat nguoi dung dong y lai
// chi vi mo lai form sua khong doi vi tri.
const toFormValues = (h: House): HouseFormValues => {
    const geoMode = resolveGeoMode(h);
    return {
        cluster: h.cluster,
        streetId:
            h.streetId && typeof h.streetId !== "string" ? h.streetId._id : "",
        streetLabel:
            h.streetId && typeof h.streetId !== "string" ? h.streetId.name : "",
        neighborhoodId:
            h.neighborhoodId && typeof h.neighborhoodId !== "string"
                ? h.neighborhoodId._id
                : "",
        neighborhoodLabel:
            h.neighborhoodId && typeof h.neighborhoodId !== "string"
                ? h.neighborhoodId.name
                : "",
        address: h.address,
        physicalStatus: h.physicalStatus || "",
        usageTypes: h.usageTypes || [],
        otherUsageNote: h.otherUsageNote || "",
        note: h.note || "",
        organizationId: "",
        organizationLabel: "",
        geoMode,
        gisLatitude: h.gisLatitude ?? null,
        gisLongitude: h.gisLongitude ?? null,
        gisAccuracyMeters: h.gisAccuracyMeters ?? null,
        gisSource: h.gisSource || "",
        geoConsentAccepted: geoMode === "address" || geoMode === "gps",
    };
};

const streetName = (streetId: House["streetId"]): string | null => {
    if (!streetId) return null;
    return typeof streetId === "string" ? null : streetId.name;
};

const neighborhoodName = (
    neighborhoodId: House["neighborhoodId"],
): string | null => {
    if (!neighborhoodId) return null;
    return typeof neighborhoodId === "string" ? null : neighborhoodId.name;
};

const ownerIdOf = (house: House): string | undefined =>
    typeof house.ownerId === "string" ? house.ownerId : house.ownerId?._id;

const HouseDetailPage: React.FC = () => (
    <RequireAuth>
        <HouseDetailContent />
    </RequireAuth>
);

const HouseDetailContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);

    const isAdmin = !!user?.roles.includes("admin");
    const canUpdate = hasPermission(user, "houses.update");
    const canVerify = hasPermission(user, "houses.verify");
    const canDelete = hasPermission(user, "houses.delete");
    const canViewHouseholds = hasPermission(user, "households.read");
    const canCreateHousehold = hasPermission(user, "households.create");
    const canViewBusinesses = hasPermission(user, "businesses.read");
    const canCreateBusiness = hasPermission(user, "businesses.create");
    const canViewCompanies = hasPermission(user, "companies.read");
    const canCreateCompany = hasPermission(user, "companies.create");

    const [house, setHouse] = useState<House | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<HouseFormValues | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    const [households, setHouseholds] = useState<Household[]>([]);
    const [householdsLoading, setHouseholdsLoading] = useState(true);
    const [householdSheetVisible, setHouseholdSheetVisible] = useState(false);
    const [householdForm, setHouseholdForm] =
        useState<HouseholdFormValues>(EMPTY_HOUSEHOLD_FORM);
    const [householdSubmitting, setHouseholdSubmitting] = useState(false);

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [businessesLoading, setBusinessesLoading] = useState(true);
    const [businessSheetVisible, setBusinessSheetVisible] = useState(false);
    const [businessForm, setBusinessForm] =
        useState<BusinessFormValues>(EMPTY_BUSINESS_FORM);
    const [businessSubmitting, setBusinessSubmitting] = useState(false);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [companySheetVisible, setCompanySheetVisible] = useState(false);
    const [companyForm, setCompanyForm] =
        useState<CompanyFormValues>(EMPTY_COMPANY_FORM);
    const [companySubmitting, setCompanySubmitting] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setError(false);
        fetchHouseById(id)
            .then(h => {
                setHouse(h);
                setForm(toFormValues(h));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    const loadHouseholds = () => {
        if (!id || !canViewHouseholds) {
            setHouseholdsLoading(false);
            return;
        }
        setHouseholdsLoading(true);
        fetchHouseHouseholds(id)
            .then(res => setHouseholds(res.items))
            .catch(() => setHouseholds([]))
            .finally(() => setHouseholdsLoading(false));
    };

    const loadBusinesses = () => {
        if (!id || !canViewBusinesses) {
            setBusinessesLoading(false);
            return;
        }
        setBusinessesLoading(true);
        fetchHouseBusinesses(id)
            .then(res => setBusinesses(res.items))
            .catch(() => setBusinesses([]))
            .finally(() => setBusinessesLoading(false));
    };

    const loadCompanies = () => {
        if (!id || !canViewCompanies) {
            setCompaniesLoading(false);
            return;
        }
        setCompaniesLoading(true);
        fetchHouseCompanies(id)
            .then(res => setCompanies(res.items))
            .catch(() => setCompanies([]))
            .finally(() => setCompaniesLoading(false));
    };

    useEffect(() => {
        load();
        loadHouseholds();
        loadBusinesses();
        loadCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const [isOwner, setIsOwner] = useState(false);
    useEffect(() => {
        const ownerId = house ? ownerIdOf(house) : undefined;
        if (!user || !house || !ownerId) {
            setIsOwner(false);
            return;
        }
        if (house.ownerType !== "organization") {
            setIsOwner(ownerId === user.id);
            return;
        }
        // Chu la to chuc - phai tra ve nguoi dai dien cua to chuc do de so
        // sanh, vi to chuc khong tu dang nhap duoc (xem resolveOwnerActingUserId
        // o backend). ownerId khong duoc backend populate san nen goi rieng.
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
    }, [house, user]);

    if (!id) return null;

    const handleSave = async () => {
        if (!form || !house) return;
        if (!isHouseFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập đầy đủ cụm dân cư và địa chỉ",
            });
            return;
        }

        const fullInput = toHouseInput(form) as unknown as Record<
            string,
            unknown
        >;
        // Neu nha da xac minh VA chinh chu nha (khong phai nhan vien) dang sua:
        // tach truong dinh danh/dia chi da thay doi thanh mot ChangeRequest,
        // cac truong con lai (physicalStatus/note) van ap dung truc tiep nhu cu.
        const needsApproval = house.status === "verified" && isOwner;
        if (!needsApproval) {
            try {
                setSaving(true);
                const updated = await updateHouse(id, toHouseInput(form));
                setHouse(updated);
                setForm(toFormValues(updated));
                setEditing(false);
                openSnackbar({ type: "success", text: "Đã cập nhật nhà số" });
            } catch (err) {
                openSnackbar({
                    type: "error",
                    text: (err as AppError).message,
                });
            } finally {
                setSaving(false);
            }
            return;
        }

        const originalInput = toHouseInput(
            toFormValues(house),
        ) as unknown as Record<string, unknown>;
        const protectedPatch: Record<string, unknown> = {};
        for (const key of HOUSE_PROTECTED_FIELDS) {
            if (
                JSON.stringify(fullInput[key]) !==
                JSON.stringify(originalInput[key])
            ) {
                protectedPatch[key] = fullInput[key];
            }
        }
        const freePatch: Record<string, unknown> = {};
        if (fullInput.physicalStatus !== originalInput.physicalStatus) {
            freePatch.physicalStatus = fullInput.physicalStatus;
        }
        if (fullInput.note !== originalInput.note) {
            freePatch.note = fullInput.note;
        }

        try {
            setSaving(true);
            let updated = house;
            if (Object.keys(freePatch).length > 0) {
                updated = await updateHouse(id, freePatch);
            }
            if (Object.keys(protectedPatch).length > 0) {
                await createChangeRequest({
                    targetModel: "HouseRecord",
                    targetId: id,
                    changeType: "update",
                    patch: protectedPatch,
                });
            }
            setHouse(updated);
            setForm(toFormValues(updated));
            setEditing(false);
            if (Object.keys(protectedPatch).length > 0) {
                openSnackbar({
                    type: "success",
                    text:
                        Object.keys(freePatch).length > 0
                            ? "Đã lưu các thay đổi và gửi yêu cầu duyệt cho thông tin còn lại"
                            : "Đã gửi yêu cầu thay đổi thông tin, chờ duyệt",
                });
            } else {
                openSnackbar({ type: "success", text: "Đã cập nhật nhà số" });
            }
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (target: HouseStatus) => {
        try {
            setStatusSubmitting(true);
            const updated = await updateHouseStatus(id, target);
            setHouse(updated);
            setForm(toFormValues(updated));
            openSnackbar({ type: "success", text: "Đã cập nhật trạng thái" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setStatusSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteHouse(id);
            openSnackbar({ type: "success", text: "Đã xóa nhà số" });
            navigate("/admin/houses", { animate: true });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const openCreateBusiness = () => {
        setBusinessForm(EMPTY_BUSINESS_FORM);
        setBusinessSheetVisible(true);
    };

    const openCreateHousehold = () => {
        if (!house) return;
        setHouseholdForm({
            ...EMPTY_HOUSEHOLD_FORM,
            houseId: id,
            houseLabel: `${house.code} — ${house.address}`,
            cluster: house.cluster,
        });
        setHouseholdSheetVisible(true);
    };

    const handleSaveHousehold = async () => {
        if (!isHouseholdFormValid(householdForm, "create")) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập đầy đủ địa chỉ, chủ hộ, số điện thoại liên hệ (và tên người liên hệ nếu khác chủ hộ)",
            });
            return;
        }
        try {
            setHouseholdSubmitting(true);
            const household = await createHousehold(
                toHouseholdInput(householdForm, "create"),
            );
            let text = "Đã thêm hộ dân";
            if (householdForm.attachments.length > 0) {
                const { failed } = await uploadPendingAttachments(
                    "Household",
                    household._id,
                    householdForm.attachments,
                );
                if (failed.length > 0) {
                    text = `${text}, nhưng ${failed.length} tài liệu tải lên thất bại`;
                }
            }
            openSnackbar({ type: "success", text });
            setHouseholdSheetVisible(false);
            loadHouseholds();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setHouseholdSubmitting(false);
        }
    };

    // Sua/xoa mot ho kinh doanh da co gio chuyen sang man chi tiet rieng
    // (/admin/businesses/:id, xem BusinessDetailPage) - can du cho de hien
    // trang thai xac thuc + tai lieu dinh kem, khong con hop ly trong mot
    // Sheet nho. Sheet o day chi con dung de tao moi (houseId co san tu ngu
    // canh trang nay).
    const handleSaveBusiness = async () => {
        if (!isBusinessFormValid(businessForm)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên hộ kinh doanh",
            });
            return;
        }
        try {
            setBusinessSubmitting(true);
            const business = await createBusiness(
                toBusinessInput(businessForm, id),
            );
            let text = "Đã thêm hộ kinh doanh";
            if (businessForm.attachments.length > 0) {
                const { failed } = await uploadPendingAttachments(
                    "Business",
                    business._id,
                    businessForm.attachments,
                );
                if (failed.length > 0) {
                    text = `${text}, nhưng ${failed.length} tài liệu tải lên thất bại`;
                }
            }
            openSnackbar({ type: "success", text });
            setBusinessSheetVisible(false);
            loadBusinesses();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setBusinessSubmitting(false);
        }
    };

    const openCreateCompany = () => {
        setCompanyForm(EMPTY_COMPANY_FORM);
        setCompanySheetVisible(true);
    };

    const handleSaveCompany = async () => {
        if (!isCompanyFormValid(companyForm)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên công ty",
            });
            return;
        }
        try {
            setCompanySubmitting(true);
            const company = await createCompany(
                toCompanyInput(companyForm, id),
            );
            let text = "Đã thêm công ty";
            if (companyForm.attachments.length > 0) {
                const { failed } = await uploadPendingAttachments(
                    "Company",
                    company._id,
                    companyForm.attachments,
                );
                if (failed.length > 0) {
                    text = `${text}, nhưng ${failed.length} tài liệu tải lên thất bại`;
                }
            }
            openSnackbar({ type: "success", text });
            setCompanySheetVisible(false);
            loadCompanies();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setCompanySubmitting(false);
        }
    };

    const statusActions: {
        label: string;
        target: HouseStatus;
        danger?: boolean;
    }[] = [];
    if (house) {
        if (isAdmin) {
            (Object.keys(HOUSE_STATUS_LABEL) as HouseStatus[])
                .filter(s => s !== house.status)
                .forEach(s =>
                    statusActions.push({
                        label: HOUSE_STATUS_LABEL[s],
                        target: s,
                        danger: s === "denied" || s === "locked",
                    }),
                );
        } else if (house.status !== "locked") {
            if (
                isOwner &&
                (house.status === "unverified" || house.status === "denied")
            ) {
                statusActions.push({ label: "Gửi duyệt", target: "pending" });
            }
            if (!isOwner && canVerify && house.status === "pending") {
                statusActions.push({ label: "Duyệt", target: "verified" });
                statusActions.push({
                    label: "Từ chối",
                    target: "denied",
                    danger: true,
                });
            }
        }
    }

    const canReviewHouseDocument = (item: RequiredDocumentItem): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        if (item.rule.reviewerRoles.length > 0) {
            return item.rule.reviewerRoles.some(r =>
                user.roles.includes(r as typeof user.roles[number]),
            );
        }
        return canVerify;
    };

    const canEditNow = canUpdate && (isAdmin || house?.status !== "locked");
    // Ho kinh doanh chi bi chan khai bao khi nha da bi tu choi hoac bi khoa
    // (xem backend assertHouseRecordAllowsDeclaration) - admin duoc bo qua
    // dieu kien nay giong backend.
    const canDeclareUnderHouse =
        isAdmin || (house?.status !== "denied" && house?.status !== "locked");
    // Phong ngua truong hop du lieu cu/chua kip dong bo khong co usageTypes
    // (vd nha tao truoc khi co tinh nang khai bao muc dich su dung) - tranh
    // crash trang trang khi goi .includes()/.map() tren undefined.
    const houseUsageTypes = house?.usageTypes || [];
    const street = streetName(house?.streetId ?? null);
    const neighborhood = neighborhoodName(house?.neighborhoodId ?? null);

    return (
        <PageLayout id="admin-house-detail" title="Chi tiết nhà số">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}

                {!loading && !error && house && form && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Text.Title size="small">
                                    {house.code}
                                </Text.Title>
                                <StatusBadge
                                    label={HOUSE_STATUS_LABEL[house.status]}
                                    tone={HOUSE_STATUS_TONE[house.status]}
                                />
                            </Box>

                            {editing ? (
                                <>
                                    <HouseForm
                                        values={form}
                                        onChange={setForm}
                                        mode="edit"
                                    />
                                    <Box mt={4} flex style={{ gap: 8 }}>
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            onClick={() => {
                                                setForm(toFormValues(house));
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
                                        value={house.cluster}
                                    />
                                    {street && (
                                        <InfoRow
                                            label="Đường/phố"
                                            value={street}
                                        />
                                    )}
                                    {neighborhood && (
                                        <InfoRow
                                            label="Tổ dân phố"
                                            value={neighborhood}
                                        />
                                    )}
                                    <InfoRow
                                        label="Địa chỉ"
                                        value={house.address}
                                    />
                                    <InfoRow
                                        label="Tình trạng công trình"
                                        value={
                                            house.physicalStatus
                                                ? HOUSE_PHYSICAL_STATUS_LABEL[
                                                      house.physicalStatus
                                                  ]
                                                : "Chưa cập nhật"
                                        }
                                    />
                                    <InfoRow
                                        label="Mục đích sử dụng"
                                        value={
                                            [
                                                ...houseUsageTypes.map(
                                                    t =>
                                                        HOUSE_USAGE_TYPE_LABEL[
                                                            t
                                                        ],
                                                ),
                                                ...(house.otherUsageNote
                                                    ? [house.otherUsageNote]
                                                    : []),
                                            ].join(", ") || "Chưa khai báo"
                                        }
                                    />
                                    <InfoRow
                                        label="Ghi chú"
                                        value={house.note || "Không có"}
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

                        <HouseOwnershipSection
                            houseId={id}
                            canManage={canUpdate}
                            currentUserId={user?.id}
                        />

                        <AttachmentUploader
                            relatedModel="HouseRecord"
                            relatedId={id}
                            canUpload={
                                (isOwner && house.status !== "verified") ||
                                canUpdate ||
                                canVerify
                            }
                            canDelete={canUpdate || canVerify}
                            fetchAttachments={fetchHouseAttachments}
                            deleteAttachmentFn={deleteHouseAttachment}
                        />

                        <RequiredDocumentsPanel
                            entityId={id}
                            relatedModel="HouseDocument"
                            fetchItems={fetchHouseRequiredDocuments}
                            onSubmit={submitHouseDocument}
                            onReview={reviewHouseDocument}
                            canSubmit={
                                isAdmin ||
                                (isOwner &&
                                    ["unverified", "pending"].includes(
                                        house.status,
                                    ))
                            }
                            canReview={canReviewHouseDocument}
                            onChanged={load}
                        />

                        {canViewHouseholds && (
                            <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Text.Title size="small">
                                        Hộ dân trong nhà
                                    </Text.Title>
                                    {canCreateHousehold &&
                                        canDeclareUnderHouse && (
                                            <Text
                                                size="xSmall"
                                                className="text-main"
                                                onClick={openCreateHousehold}
                                            >
                                                + Thêm
                                            </Text>
                                        )}
                                </Box>
                                {houseUsageTypes.includes("household") &&
                                    !householdsLoading &&
                                    households.length === 0 && (
                                        <UsageWarningBanner text="Nhà đã khai báo có hộ dân sinh sống nhưng chưa khai báo hộ dân nào. Vui lòng bổ sung để việc xác thực được đầy đủ." />
                                    )}
                                {householdsLoading && <LoadingState />}
                                {!householdsLoading &&
                                    households.length === 0 && (
                                        <EmptyState label="Chưa có hộ dân nào trong nhà này" />
                                    )}
                                {!householdsLoading &&
                                    households.map(h => (
                                        <ListRow
                                            key={h._id}
                                            title={`${h.code} — ${h.headOfHousehold}`}
                                            subtitle={h.address}
                                            right={
                                                <StatusBadge
                                                    label={
                                                        VERIFICATION_STATUS_LABEL[
                                                            h.status
                                                        ]
                                                    }
                                                    tone={
                                                        VERIFICATION_STATUS_TONE[
                                                            h.status
                                                        ]
                                                    }
                                                />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/admin/households/${h._id}`,
                                                    { animate: true },
                                                )
                                            }
                                        />
                                    ))}
                            </Box>
                        )}

                        {canViewBusinesses && (
                            <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Text.Title size="small">
                                        Hộ kinh doanh
                                    </Text.Title>
                                    {canCreateBusiness && canDeclareUnderHouse && (
                                        <Text
                                            size="xSmall"
                                            className="text-main"
                                            onClick={openCreateBusiness}
                                        >
                                            + Thêm
                                        </Text>
                                    )}
                                </Box>
                                {houseUsageTypes.includes("business") &&
                                    !businessesLoading &&
                                    businesses.length === 0 && (
                                        <UsageWarningBanner text="Nhà đã khai báo có hộ kinh doanh nhưng chưa khai báo hộ kinh doanh nào. Vui lòng bổ sung để việc xác thực được đầy đủ." />
                                    )}
                                {businessesLoading && <LoadingState />}
                                {!businessesLoading &&
                                    businesses.length === 0 && (
                                        <EmptyState label="Chưa có hộ kinh doanh nào trong nhà này" />
                                    )}
                                {!businessesLoading &&
                                    businesses.map(b => (
                                        <ListRow
                                            key={b._id}
                                            title={b.name}
                                            subtitle={b.ownerName || b.phone}
                                            right={
                                                <StatusBadge
                                                    label={
                                                        VERIFICATION_STATUS_LABEL[
                                                            b.status
                                                        ]
                                                    }
                                                    tone={
                                                        VERIFICATION_STATUS_TONE[
                                                            b.status
                                                        ]
                                                    }
                                                />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/admin/businesses/${b._id}`,
                                                    { animate: true },
                                                )
                                            }
                                        />
                                    ))}
                            </Box>
                        )}

                        {canViewCompanies && (
                            <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Text.Title size="small">
                                        Công ty
                                    </Text.Title>
                                    {canCreateCompany && canDeclareUnderHouse && (
                                        <Text
                                            size="xSmall"
                                            className="text-main"
                                            onClick={openCreateCompany}
                                        >
                                            + Thêm
                                        </Text>
                                    )}
                                </Box>
                                {houseUsageTypes.includes("company") &&
                                    !companiesLoading &&
                                    companies.length === 0 && (
                                        <UsageWarningBanner text="Nhà đã khai báo có công ty nhưng chưa khai báo công ty nào. Vui lòng bổ sung để việc xác thực được đầy đủ." />
                                    )}
                                {companiesLoading && <LoadingState />}
                                {!companiesLoading &&
                                    companies.length === 0 && (
                                        <EmptyState label="Chưa có công ty nào trong nhà này" />
                                    )}
                                {!companiesLoading &&
                                    companies.map(c => (
                                        <ListRow
                                            key={c._id}
                                            title={c.name}
                                            subtitle={c.ownerName || c.phone}
                                            right={
                                                <StatusBadge
                                                    label={
                                                        VERIFICATION_STATUS_LABEL[
                                                            c.status
                                                        ]
                                                    }
                                                    tone={
                                                        VERIFICATION_STATUS_TONE[
                                                            c.status
                                                        ]
                                                    }
                                                />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/admin/companies/${c._id}`,
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
                title="Xóa nhà số?"
                description={`Bạn có chắc muốn xóa nhà ${
                    house?.code || ""
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
                visible={businessSheetVisible}
                onClose={() => setBusinessSheetVisible(false)}
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
                        <BusinessForm
                            values={businessForm}
                            onChange={setBusinessForm}
                        />
                    </Box>
                    <Box mt={3} flex style={{ gap: 8 }}>
                        <Button
                            fullWidth
                            loading={businessSubmitting}
                            onClick={handleSaveBusiness}
                        >
                            Lưu
                        </Button>
                    </Box>
                </Box>
            </Sheet>

            <Sheet
                visible={householdSheetVisible}
                onClose={() => setHouseholdSheetVisible(false)}
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
                        <HouseholdForm
                            values={householdForm}
                            onChange={setHouseholdForm}
                            mode="create"
                        />
                    </Box>
                    <Box mt={3} flex style={{ gap: 8 }}>
                        <Button
                            fullWidth
                            loading={householdSubmitting}
                            onClick={handleSaveHousehold}
                        >
                            Lưu
                        </Button>
                    </Box>
                </Box>
            </Sheet>

            <Sheet
                visible={companySheetVisible}
                onClose={() => setCompanySheetVisible(false)}
                title="Thêm công ty"
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
                        <CompanyForm
                            values={companyForm}
                            onChange={setCompanyForm}
                        />
                    </Box>
                    <Box mt={3} flex style={{ gap: 8 }}>
                        <Button
                            fullWidth
                            loading={companySubmitting}
                            onClick={handleSaveCompany}
                        >
                            Lưu
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </PageLayout>
    );
};

const UsageWarningBanner: React.FC<{ text: string }> = ({ text }) => (
    <Box className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-2">
        <Text size="xxSmall" className="text-yellow-800">
            {text}
        </Text>
    </Box>
);

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

export default HouseDetailPage;
