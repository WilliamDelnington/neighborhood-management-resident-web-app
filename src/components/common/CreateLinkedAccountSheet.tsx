import React, { useState } from "react";
import { Box, Sheet, useSnackbar } from "@components/ui";
import { Button, Input } from "@components/customized";
import { AppError } from "@dts";
import { CreateLinkedAccountInput } from "@service/userApi";

export interface CreateLinkedAccountSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    onCreated: () => void;
    onSubmit: (input: CreateLinkedAccountInput) => Promise<unknown>;
}

const EMPTY_FORM = {
    phone: "",
    displayName: "",
    address: "",
    idNumber: "",
    password: "",
};

/**
 * Sheet dung chung cho chu nha (house_owner) tu tao tai khoan quan ly thay MOT
 * thuc the cu the cua minh (chu ho cua 1 ho dan, dai dien cua 1 ho kinh doanh/
 * cong ty) - xem HouseholdDetailPage.tsx/BusinessDetailPage.tsx/
 * CompanyDetailPage.tsx (noi goi component nay voi onSubmit tuong ung
 * createHouseholdHeadAccount/createBusinessRepresentativeAccount/
 * createCompanyRepresentativeAccount). Mat khau BAT BUOC o day (khac backend,
 * cho phep bo trong) vi ung dung chi ho tro dang nhap phone+mat khau (chua co
 * OTP/Zalo login) - tai khoan khong dat mat khau se khong dang nhap duoc.
 */
const CreateLinkedAccountSheet: React.FC<CreateLinkedAccountSheetProps> = ({
    visible,
    onClose,
    title,
    onCreated,
    onSubmit,
}) => {
    const { openSnackbar } = useSnackbar();
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const set = <K extends keyof typeof EMPTY_FORM>(
        key: K,
        value: (typeof EMPTY_FORM)[K],
    ) => setForm(prev => ({ ...prev, [key]: value }));

    const isValid =
        form.phone.trim().length > 0 &&
        form.displayName.trim().length > 0 &&
        form.password.trim().length >= 6;

    const handleClose = () => {
        setForm(EMPTY_FORM);
        onClose();
    };

    const handleSubmit = async () => {
        if (!isValid) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập đầy đủ số điện thoại, họ tên và mật khẩu (ít nhất 6 ký tự)",
            });
            return;
        }
        try {
            setSubmitting(true);
            await onSubmit({
                phone: form.phone.trim(),
                displayName: form.displayName.trim(),
                address: form.address.trim() || undefined,
                idNumber: form.idNumber.trim() || undefined,
                password: form.password.trim(),
            });
            openSnackbar({ type: "success", text: "Đã tạo tài khoản" });
            setForm(EMPTY_FORM);
            onCreated();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sheet
            visible={visible}
            onClose={handleClose}
            title={title}
            height="85vh"
            autoHeight={false}
        >
            <Box
                p={4}
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
                <Box style={{ flex: 1, overflowY: "auto" }}>
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
                </Box>
                <Box mt={3}>
                    <Button fullWidth loading={submitting} onClick={handleSubmit}>
                        Tạo tài khoản
                    </Button>
                </Box>
            </Box>
        </Sheet>
    );
};

export default CreateLinkedAccountSheet;
