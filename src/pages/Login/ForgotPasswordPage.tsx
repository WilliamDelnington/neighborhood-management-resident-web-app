import React, { useState } from "react";
import { Box, Text, useNavigate, useSnackbar } from "@components/ui";
import { PageLayout, DefaultHeader } from "@components/layout";
import { Button, Input } from "@components/customized";
import { isValidVietnamesePhone } from "@utils/string";
import {
    checkPasswordResetRequest,
    createPasswordResetRequest,
    revealPasswordResetRequest,
} from "@service/passwordResetRequestApi";

/**
 * Man "Quen mat khau" - thay the toast cu chi bao lien he to truong (khong
 * lam gi ca). Quy trinh 2 buoc vi chua co SMS/Zalo OA that (xem
 * notification_channels): (1) gui yeu cau, backend bao dich danh cho to
 * truong/to pho phu trach so nay (xem resolveResponsibleLeaderIds); (2) nguoi
 * dung tu quay lai man nay, nhap lai so dien thoai de "kiem tra" xem to
 * truong da dat lai mat khau chua - neu roi thi lay mat khau moi ngay tren
 * man hinh nay (revealPasswordResetRequest, chi lay duoc MOT LAN). Dang nhap
 * lai bang mat khau tam do se bi bat doi mat khau ngay (User.mustChangePassword),
 * giong luong tai khoan duoc cap san.
 */
const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();

    const [phone, setPhone] = useState("");
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [revealed, setRevealed] = useState<string | null>(null);

    const validatePhone = () => {
        if (!isValidVietnamesePhone(phone.trim())) {
            openSnackbar({
                type: "error",
                text: "Số điện thoại không hợp lệ",
            });
            return false;
        }
        return true;
    };

    const handleSendRequest = async () => {
        if (!validatePhone()) return;
        try {
            setSending(true);
            await createPasswordResetRequest(phone.trim());
            setRevealed(null);
            openSnackbar({
                type: "success",
                text: "Đã gửi yêu cầu tới tổ trưởng/cán bộ phụ trách. Vui lòng quay lại màn hình này sau ít phút để lấy mật khẩu mới.",
                duration: 6000,
            });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
            });
        } finally {
            setSending(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!validatePhone()) return;
        try {
            setChecking(true);
            const { state } = await checkPasswordResetRequest(phone.trim());
            if (state === "none") {
                openSnackbar({
                    type: "info",
                    text: "Chưa có yêu cầu nào đang chờ xử lý cho số điện thoại này. Vui lòng gửi yêu cầu trước.",
                });
                return;
            }
            if (state === "pending") {
                openSnackbar({
                    type: "info",
                    text: "Yêu cầu của bạn đang chờ tổ trưởng/cán bộ xử lý, vui lòng quay lại kiểm tra sau.",
                });
                return;
            }
            const { password } = await revealPasswordResetRequest(phone.trim());
            setRevealed(password);
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
            });
        } finally {
            setChecking(false);
        }
    };

    const handleLoginNow = () => {
        navigate("/login", {
            animate: true,
            replace: true,
            state: { prefillPhone: phone.trim(), prefillPassword: revealed },
        });
    };

    return (
        <PageLayout
            id="forgot-password-page"
            customHeader={
                <DefaultHeader
                    title="Quên mật khẩu"
                    back
                    onBackClick={() => navigate(-1)}
                />
            }
        >
            <Box p={6}>
                <Box className="bg-white rounded-3xl shadow-card p-5 w-full">
                    <Text size="small" className="text-text_2 mb-4">
                        Nhập số điện thoại đã đăng ký. Yêu cầu sẽ được gửi tới
                        tổ trưởng tổ dân phố hoặc cán bộ phụ trách để đặt lại
                        mật khẩu giúp bạn.
                    </Text>

                    <Input
                        label="Số điện thoại"
                        placeholder="0xxxxxxxxx"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />

                    <Box mt={4}>
                        <Button
                            fullWidth
                            loading={sending}
                            onClick={handleSendRequest}
                        >
                            Gửi yêu cầu đặt lại mật khẩu
                        </Button>
                    </Box>
                    <Box mt={2}>
                        <Button
                            fullWidth
                            variant="secondary"
                            loading={checking}
                            onClick={handleCheckStatus}
                        >
                            Đã gửi yêu cầu trước đó? Kiểm tra mật khẩu mới
                        </Button>
                    </Box>

                    {revealed && (
                        <Box
                            mt={4}
                            className="rounded-2xl p-4"
                            style={{
                                border: "1.5px dashed #05AAC0",
                                background: "#F0FDFF",
                            }}
                        >
                            <Text size="small" className="text-text_2 mb-2">
                                Mật khẩu mới của bạn là:
                            </Text>
                            <Text.Title
                                size="small"
                                className="text-center tracking-widest mb-3"
                            >
                                {revealed}
                            </Text.Title>
                            <Text size="xSmall" className="text-text_2 mb-3">
                                Vui lòng đăng nhập ngay bằng mật khẩu này. Bạn
                                sẽ được yêu cầu đặt mật khẩu mới của riêng mình.
                            </Text>
                            <Button fullWidth onClick={handleLoginNow}>
                                Đăng nhập ngay
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </PageLayout>
    );
};

export default ForgotPasswordPage;
