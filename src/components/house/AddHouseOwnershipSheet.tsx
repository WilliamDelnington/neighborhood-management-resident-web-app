import React, { useState } from "react";
import { Box, Sheet, Text, useSnackbar } from "@components/ui";
import { Button, Input, Radio, TextArea } from "@components/customized";
import OrganizationPickerSheet from "@components/house/OrganizationPickerSheet";
import { hasPermission } from "@components/role";
import { useStore } from "@store";
import { HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL } from "@constants/domain";
import {
    AppError,
    HouseOwnershipRelationshipType,
    Organization,
    OwnerType,
} from "@dts";
import { addHouseOwnership } from "@service/houseOwnershipApi";

const RELATIONSHIP_TYPES = Object.keys(
    HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL,
) as HouseOwnershipRelationshipType[];

export interface AddHouseOwnershipSheetProps {
    visible: boolean;
    onClose: () => void;
    houseId: string;
    onAdded: () => void;
}

/**
 * Sheet them dong so huu/nguoi quan ly (hoac chuyen chu so huu chinh, neu
 * chon relationshipType="primary_owner") cho mot nha so - xem
 * houseOwnershipService.addHouseOwnership o backend. Voi ownerType="user",
 * nhap so dien thoai thay vi chon tu danh sach: house_owner khong co quyen
 * tim kiem tai khoan nguoi khac (users.read la quyen cua nhan vien), backend
 * tu tim tai khoan CO SAN theo so dien thoai.
 *
 * Nguoi co quyen "users.create" (vd to truong/admin, KHONG phai house_owner
 * thuong) con thay them muc "Ho ten"/"Mat khau" - neu so dien thoai CHUA co
 * tai khoan, backend se tao tai khoan moi luon voi mat khau nay (TAM THOI
 * dung phone+password thay OTP - xem LoginPage.tsx); neu da co tai khoan, hai
 * truong nay bi bo qua.
 */
const AddHouseOwnershipSheet: React.FC<AddHouseOwnershipSheetProps> = ({
    visible,
    onClose,
    houseId,
    onAdded,
}) => {
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canCreateAccount = hasPermission(user, "users.create");
    const [relationshipType, setRelationshipType] =
        useState<HouseOwnershipRelationshipType>("co_owner");
    const [ownerType, setOwnerType] = useState<OwnerType>("user");
    const [phone, setPhone] = useState("");
    const [newAccountName, setNewAccountName] = useState("");
    const [newAccountPassword, setNewAccountPassword] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const [organizationLabel, setOrganizationLabel] = useState("");
    const [organizationPickerVisible, setOrganizationPickerVisible] =
        useState(false);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reset = () => {
        setRelationshipType("co_owner");
        setOwnerType("user");
        setPhone("");
        setNewAccountName("");
        setNewAccountPassword("");
        setOrganizationId("");
        setOrganizationLabel("");
        setReason("");
    };

    const handleSubmit = async () => {
        if (ownerType === "user" && !phone.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập số điện thoại",
            });
            return;
        }
        if (ownerType === "organization" && !organizationId) {
            openSnackbar({ type: "error", text: "Vui lòng chọn tổ chức" });
            return;
        }
        try {
            setSubmitting(true);
            await addHouseOwnership(houseId, {
                ownerType,
                phone: ownerType === "user" ? phone.trim() : undefined,
                ownerId:
                    ownerType === "organization" ? organizationId : undefined,
                displayName:
                    ownerType === "user" && canCreateAccount
                        ? newAccountName.trim() || undefined
                        : undefined,
                password:
                    ownerType === "user" && canCreateAccount
                        ? newAccountPassword.trim() || undefined
                        : undefined,
                relationshipType,
                reason: reason.trim() || undefined,
            });
            openSnackbar({
                type: "success",
                text:
                    relationshipType === "primary_owner"
                        ? "Đã chuyển chủ sở hữu chính"
                        : "Đã thêm quan hệ sở hữu",
            });
            reset();
            onClose();
            onAdded();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Thêm quan hệ sở hữu"
            height="90vh"
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
                    <Box mb={3}>
                        <Text size="xSmall" className="text-text_2 mb-1">
                            Vai trò
                        </Text>
                        <Box
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                        >
                            {RELATIONSHIP_TYPES.map(key => (
                                <Radio
                                    key={key}
                                    label={
                                        HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL[
                                            key
                                        ] +
                                        (key === "primary_owner"
                                            ? " (thay thế chủ hiện tại)"
                                            : "")
                                    }
                                    checked={relationshipType === key}
                                    onChange={() => setRelationshipType(key)}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box mb={3}>
                        <Text size="xSmall" className="text-text_2 mb-1">
                            Loại chủ thể
                        </Text>
                        <Box flex style={{ gap: 16 }}>
                            <Radio
                                label="Cá nhân"
                                checked={ownerType === "user"}
                                onChange={() => setOwnerType("user")}
                            />
                            <Radio
                                label="Tổ chức"
                                checked={ownerType === "organization"}
                                onChange={() => setOwnerType("organization")}
                            />
                        </Box>
                    </Box>

                    {ownerType === "user" ? (
                        <Box mb={3}>
                            <Input
                                label="Số điện thoại"
                                placeholder="VD: 0912345678"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                            <Text size="xxSmall" className="text-text_2 mt-1">
                                {canCreateAccount
                                    ? "Nếu số này chưa có tài khoản, điền họ tên + mật khẩu dưới đây để tạo tài khoản mới."
                                    : "Người này cần đã có tài khoản trong ứng dụng."}
                            </Text>
                            {canCreateAccount && (
                                <>
                                    <Box mt={3}>
                                        <Input
                                            label="Họ tên (nếu tạo tài khoản mới)"
                                            value={newAccountName}
                                            onChange={e =>
                                                setNewAccountName(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Box>
                                    <Box mt={3}>
                                        <Input
                                            type="password"
                                            label="Mật khẩu (nếu tạo tài khoản mới)"
                                            placeholder="Ít nhất 6 ký tự"
                                            value={newAccountPassword}
                                            onChange={e =>
                                                setNewAccountPassword(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box mb={3}>
                            <Text size="xSmall" className="text-text_2 mb-1">
                                Tổ chức
                            </Text>
                            <Box
                                className="bg-ng_10 rounded-lg px-3 py-2"
                                onClick={() =>
                                    setOrganizationPickerVisible(true)
                                }
                            >
                                <Text
                                    size="small"
                                    className={
                                        organizationId ? "" : "text-text_3"
                                    }
                                >
                                    {organizationId
                                        ? organizationLabel || organizationId
                                        : "Chọn tổ chức..."}
                                </Text>
                            </Box>
                        </Box>
                    )}

                    <TextArea
                        label="Ghi chú (không bắt buộc)"
                        placeholder="VD: Vợ/chồng đồng sở hữu, ủy quyền quản lý khi vắng nhà..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </Box>
                <Box mt={3}>
                    <Button
                        fullWidth
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        Lưu
                    </Button>
                </Box>
            </Box>

            <OrganizationPickerSheet
                visible={organizationPickerVisible}
                onClose={() => setOrganizationPickerVisible(false)}
                onSelect={(organization: Organization) => {
                    setOrganizationId(organization._id);
                    setOrganizationLabel(organization.name);
                }}
            />
        </Sheet>
    );
};

export default AddHouseOwnershipSheet;
