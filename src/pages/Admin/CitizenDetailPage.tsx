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
import { ErrorState, LoadingState } from "@components/admin";
import { Button } from "@components/customized";
import { RequireAuth, hasPermission } from "@components/role";
import {
    CitizenForm,
    CitizenFormValues,
    isCitizenFormValid,
    toCitizenInput,
} from "@components/citizen";
import { useStore } from "@store";
import { GIOI_TINH_LABEL, LOAI_CU_TRU_LABEL } from "@constants/domain";
import { AppError, Citizen, Household } from "@dts";
import {
    deleteCitizen,
    fetchCitizenById,
    updateCitizen,
} from "@service/citizenApi";

const toFormValues = (c: Citizen): CitizenFormValues => {
    const household =
        typeof c.householdId === "object"
            ? (c.householdId as Household)
            : undefined;
    return {
        fullName: c.fullName,
        phone: c.phone || "",
        cccd: c.cccd || "",
        birthDate: c.birthDate ? new Date(c.birthDate) : null,
        gender: c.gender,
        relationToHead: c.relationToHead || "",
        householdId:
            typeof c.householdId === "string"
                ? c.householdId
                : household?._id || "",
        householdLabel: household
            ? `${household.code} — ${household.address}`
            : "",
        residenceType: c.residenceType,
        temporaryResidenceExpiresAt: c.temporaryResidenceExpiresAt
            ? new Date(c.temporaryResidenceExpiresAt)
            : null,
        isElderly: c.isElderly,
        isChild: c.isChild,
        isDisabledOrSupportNeeded: c.isDisabledOrSupportNeeded,
        isPartyMember: c.isPartyMember,
        isUnionMember: c.isUnionMember,
        attachments: [],
    };
};

const CitizenDetailPage: React.FC = () => (
    <RequireAuth>
        <CitizenDetailContent />
    </RequireAuth>
);

const CitizenDetailContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canUpdate = hasPermission(user, "citizens.update");
    const canDelete = hasPermission(user, "citizens.delete");

    const [citizen, setCitizen] = useState<Citizen | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CitizenFormValues | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setError(false);
        fetchCitizenById(id)
            .then(c => {
                setCitizen(c);
                setForm(toFormValues(c));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!id) return null;

    const handleSave = async () => {
        if (!form) return;
        if (!isCitizenFormValid(form)) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập họ tên và chọn hộ khẩu",
            });
            return;
        }
        try {
            setSaving(true);
            const updated = await updateCitizen(id, toCitizenInput(form));
            setCitizen(updated);
            setForm(toFormValues(updated));
            setEditing(false);
            openSnackbar({ type: "success", text: "Đã cập nhật nhân khẩu" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteCitizen(id);
            openSnackbar({ type: "success", text: "Đã xóa nhân khẩu" });
            navigate("/admin/citizens", { animate: true });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <PageLayout id="admin-citizen-detail" title="Chi tiết nhân khẩu">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}

                {!loading && !error && citizen && form && (
                    <Box className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text.Title size="small" className="mb-2">
                            {citizen.fullName}
                        </Text.Title>

                        {editing ? (
                            <>
                                <CitizenForm
                                    values={form}
                                    onChange={setForm}
                                    showAttachments={false}
                                />
                                <Box mt={4} flex style={{ gap: 8 }}>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            setForm(toFormValues(citizen));
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
                                    label="Hộ khẩu"
                                    value={
                                        form.householdId
                                            ? form.householdLabel
                                            : "Chưa liên kết"
                                    }
                                />
                                <InfoRow
                                    label="Số điện thoại"
                                    value={citizen.phone || "Chưa cập nhật"}
                                />
                                <InfoRow
                                    label="Số CCCD"
                                    value={citizen.cccd || "Chưa cập nhật"}
                                />
                                <InfoRow
                                    label="Ngày sinh"
                                    value={
                                        citizen.birthDate
                                            ? new Date(
                                                  citizen.birthDate,
                                              ).toLocaleDateString("vi-VN")
                                            : "Chưa cập nhật"
                                    }
                                />
                                <InfoRow
                                    label="Giới tính"
                                    value={GIOI_TINH_LABEL[citizen.gender]}
                                />
                                <InfoRow
                                    label="Quan hệ với chủ hộ"
                                    value={
                                        citizen.relationToHead ||
                                        "Chưa cập nhật"
                                    }
                                />
                                <InfoRow
                                    label="Loại cư trú"
                                    value={
                                        LOAI_CU_TRU_LABEL[citizen.residenceType]
                                    }
                                />

                                {(canUpdate || canDelete) && (
                                    <Box mt={4} flex style={{ gap: 8 }}>
                                        {canUpdate && (
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
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </Box>

            <Modal
                visible={confirmDelete}
                title="Xóa nhân khẩu?"
                description={`Bạn có chắc muốn xóa nhân khẩu ${
                    citizen?.fullName || ""
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

export default CitizenDetailPage;
