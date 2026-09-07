import React, { useState } from "react";
import {
    Box,
    Text,
    useLocation,
    useNavigate,
    useSnackbar,
} from "@components/ui";
import { PageLayout, DefaultHeader } from "@components/layout";
import { Button, Input } from "@components/customized";
import { RequireAuth } from "@components/role";
import { useStore } from "@store";
import {
    setPassword as setPasswordApi,
    logout as logoutApi,
} from "@service/authApi";

/**
 * Man hinh doi mat khau BAT BUOC, hien thi khi user.mustChangePassword=true
 * (tai khoan dang dung mat khau do nguoi khac dat thay - import Excel, nhan
 * vien tao ho, admin dat lai - xem User.mustChangePassword o backend).
 * RequireAuth (o day va o app.tsx) se tu dieu huong nguoi dung ve day cho toi
 * khi doi mat khau xong; backend cung tu chan moi API khac (rbac.ts
 * requireUser tra ve 423) nen day chi la buoc UI, khong phai co che bao mat
 * chinh.
 *
 * currentPassword lay tu location.state (LoginPage dieu huong sang day kem
 * theo mat khau vua go) de nguoi dung CHI can go mat khau moi 2 lan, khong
 * phai go lai mat khau tam thoi. Neu thieu (vd vao thang duong dan nay) thi
 * hien them truong "Mật khẩu hiện tại" nhu man doi mat khau thuong (xem
 * AccountPage.tsx).
 */
const ChangePasswordRequiredPage: React.FC = () => (
    <RequireAuth>
        <ChangePasswordRequiredContent />
    </RequireAuth>
);

const ChangePasswordRequiredContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSnackbar } = useSnackbar();
    const [setUser, logout] = useStore(state => [state.setUser, state.logout]);

    const prefilledCurrentPassword =
        (location.state as { currentPassword?: string } | null)
            ?.currentPassword || "";
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (newPassword.length < 6) {
            openSnackbar({
                type: "error",
                text: "Mật khẩu mới phải có ít nhất 6 ký tự",
            });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            openSnackbar({
                type: "error",
                text: "Mật khẩu nhập lại không khớp",
            });
            return;
        }
        try {
            setSubmitting(true);
            const updatedUser = await setPasswordApi(
                newPassword,
                prefilledCurrentPassword || currentPassword,
            );
            setUser(updatedUser);
            openSnackbar({
                type: "success",
                text: "Đã đổi mật khẩu thành công",
            });
            navigate("/", { animate: true, replace: true });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            // Da mat khau/token khong con hop le - van dang xuat o client.
        } finally {
            logout();
            navigate("/login", { animate: true, replace: true });
        }
    };

    return (
        <PageLayout
            id="change-password-required-page"
            customHeader={<DefaultHeader title="Đổi mật khẩu" />}
        >
            <Box p={6}>
                <Text size="small" className="text-text_2 mb-4">
                    Tài khoản của bạn đang dùng mật khẩu tạm thời do được cấp
                    sẵn. Vui lòng đặt mật khẩu mới của riêng bạn trước khi tiếp
                    tục sử dụng ứng dụng.
                </Text>

                {!prefilledCurrentPassword && (
                    <Box mb={3}>
                        <Input
                            type="password"
                            label="Mật khẩu hiện tại"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </Box>
                )}
                <Box mb={3}>
                    <Input
                        type="password"
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                </Box>
                <Box mb={4}>
                    <Input
                        type="password"
                        label="Nhập lại mật khẩu mới"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                    />
                </Box>

                <Button fullWidth loading={submitting} onClick={handleSubmit}>
                    Xác nhận đổi mật khẩu
                </Button>
                <Button
                    fullWidth
                    variant="secondary"
                    className="mt-2"
                    onClick={handleLogout}
                >
                    Đăng xuất
                </Button>
            </Box>
        </PageLayout>
    );
};

export default ChangePasswordRequiredPage;
