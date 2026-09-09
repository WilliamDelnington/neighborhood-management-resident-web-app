import React, { useEffect, useState } from "react";
import { Box, Text, useSnackbar } from "@components/ui";
import { Button, Input, Radio } from "@components/customized";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";
import { AppError, Role } from "@dts";
import { createAccount, fetchCreatableRoles } from "@service/userApi";

type FormState = {
    phone: string;
    displayName: string;
    address: string;
    idNumber: string;
    password: string;
    role: Role;
};

const EMPTY_FORM: FormState = {
    phone: "",
    displayName: "",
    address: "",
    idNumber: "",
    password: "",
    role: "house_owner",
};

const CreateAccountPage: React.FC = () => (
    <RequireAuth>
        <CreateAccountContent />
    </RequireAuth>
);

/**
 * Man "Tạo tài khoản" trong khu Quản trị - danh cho bat ky ai co quyen
 * "users.create" (to truong/to pho/vai tro tuy chinh duoc admin cap quyen...),
 * dung chung endpoint POST /api/users voi admin-web-app
 * (userService.createHouseOwnerByStaff), KHAC voi luong tao tai khoan long
 * trong AddHouseOwnershipSheet (gan chet vao house_owner + mot Nha so cu
 * the) - o day tao mot tai khoan doc lap, chua gan vao Nha so/To dan pho nao.
 *
 * Vai tro duoc phep chon lay tu fetchCreatableRoles() (server-driven, xem
 * userService.getCreatableRolesForActor) - luon co "Chủ sở hữu", cong them
 * cac vai tro duoc admin cau hinh rieng cho vai tro cua actor qua man Quan ly
 * vai trò (admin-web-app).
 */
const CreateAccountContent: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [creatableRoles, setCreatableRoles] = useState<
        { key: Role; name: string }[]
    >([]);
    const [saving, setSaving] = useState(false);
    const [lastCreatedPhone, setLastCreatedPhone] = useState<string | null>(
        null,
    );

    useEffect(() => {
        fetchCreatableRoles()
            .then(setCreatableRoles)
            .catch(() => setCreatableRoles([]));
    }, []);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const isValid =
        form.phone.trim().length > 0 &&
        form.displayName.trim().length > 0 &&
        form.password.trim().length >= 6;

    const handleCreate = async () => {
        if (!isValid) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập đầy đủ số điện thoại, họ tên và mật khẩu (ít nhất 6 ký tự)",
            });
            return;
        }
        try {
            setSaving(true);
            await createAccount({
                phone: form.phone.trim(),
                displayName: form.displayName.trim(),
                address: form.address.trim() || undefined,
                idNumber: form.idNumber.trim() || undefined,
                role: form.role,
                password: form.password.trim(),
            });
            openSnackbar({ type: "success", text: "Đã tạo tài khoản mới" });
            setLastCreatedPhone(form.phone.trim());
            setForm(EMPTY_FORM);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageLayout id="admin-create-account" title="Tạo tài khoản">
            <Box p={4}>
                {lastCreatedPhone && (
                    <Box
                        mb={3}
                        p={3}
                        className="bg-ng_10 rounded-lg"
                        style={{ border: "1px solid #b7e4c7" }}
                    >
                        Đã tạo tài khoản với số điện thoại{" "}
                        <strong>{lastCreatedPhone}</strong>. Đăng nhập bằng số
                        điện thoại và mật khẩu vừa đặt.
                    </Box>
                )}

                {creatableRoles.length > 1 && (
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
                            {creatableRoles.map(option => (
                                <Radio
                                    key={option.key}
                                    label={option.name}
                                    checked={form.role === option.key}
                                    onChange={() => set("role", option.key)}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Box mb={3}>
                    <Input
                        label="Số điện thoại"
                        placeholder="VD: 0912345678"
                        value={form.phone}
                        onChange={e =>
                            set("phone", e.target.value.replace(/\D/g, ""))
                        }
                    />
                </Box>
                <Box mb={3}>
                    <Input
                        label="Họ tên"
                        placeholder="VD: Nguyễn Văn A"
                        value={form.displayName}
                        onChange={e => set("displayName", e.target.value)}
                    />
                </Box>
                <Box mb={3}>
                    <Input
                        label="Địa chỉ (tùy chọn)"
                        value={form.address}
                        onChange={e => set("address", e.target.value)}
                    />
                </Box>
                <Box mb={3}>
                    <Input
                        label="Số CMND/CCCD (tùy chọn)"
                        value={form.idNumber}
                        onChange={e => set("idNumber", e.target.value)}
                    />
                </Box>
                <Box mb={3}>
                    <Input
                        type="password"
                        label="Mật khẩu"
                        placeholder="Ít nhất 6 ký tự"
                        value={form.password}
                        onChange={e => set("password", e.target.value)}
                    />
                </Box>

                <Button fullWidth loading={saving} onClick={handleCreate}>
                    Tạo tài khoản
                </Button>
            </Box>
        </PageLayout>
    );
};

export default CreateAccountPage;
