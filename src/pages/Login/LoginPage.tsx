import React, { useEffect, useState } from "react";
import {
    Box,
    Icon,
    Text,
    useLocation,
    useNavigate,
    useSnackbar,
} from "@components/ui";
import { PageLayout, DefaultHeader } from "@components/layout";
import { Button, Input } from "@components/customized";
import { useStore } from "@store";
import { ROLE_LABEL, APP_NAME_DEFAULT } from "@constants/domain";
import { Role } from "@dts";
import { isValidVietnamesePhone } from "@utils/string";
import Logo from "@assets/logo.png";

type PhoneAuthMode = "login" | "register";

/**
 * Danh sach tai khoan mau tao boi backend-app/scripts/seed.ts - dung de test nhanh tung vai tro
 * trong luc dev, vi mot tai khoan Zalo that la duy nhat nen khong the dung 1 tai khoan Zalo
 * de kiem tra ca 6 vai tro. Neu doi zaloUserId trong seed.ts thi phai sua lai o day.
 */
const DEV_TEST_ACCOUNTS: { zaloUserId: string; name: string; role: Role }[] = [
    { zaloUserId: "seed-admin", name: "Quản trị viên Hòa Bình", role: "admin" },
    {
        zaloUserId: "seed-leader",
        name: "Nguyễn Văn Tổ Trưởng",
        role: "neighborhood_leader",
    },
    {
        zaloUserId: "seed-secretary",
        name: "Trần Thị Bí Thư",
        role: "secretary",
    },
    {
        zaloUserId: "seed-police",
        name: "Lê Văn Công An",
        role: "regional_police",
    },
    {
        zaloUserId: "seed-committee",
        name: "Phạm Thị Cán Bộ UBND",
        role: "people_committee_official",
    },
    {
        zaloUserId: "seed-house-owner",
        name: "Hoàng Văn Dân",
        role: "house_owner",
    },
];

/**
 * Man hinh dang nhap: kenh dang nhap/dang ky duy nhat la so dien thoai + mat
 * khau (loginWithPhone/registerWithPhone).
 *
 * OTP (eSMS/Zalo ZNS) da duoc XAY XONG o backend (otpService.ts, lib/esms.ts,
 * lib/esmsZns.ts) nhung TAM HOAN dung o man hinh nay - eSMS/Zalo ZNS deu can
 * mau tin duoc duyet truoc (2-3 ngay), khong kip cho demo. Code OTP van con,
 * chi khong duoc goi tu day nua; bat lai bang cach doi UI ve dung
 * requestOtp/verifyOtp trong @store/authSlice.ts khi cac mau tin da duoc
 * duyet.
 *
 * Ngoai tu dang ky, tai khoan con co the duoc to truong/nguoi co quyen tao
 * san (kem mat khau) tu form tao ho/nha trong khu Admin - xem
 * components/house/AddHouseOwnershipSheet.tsx.
 */
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSnackbar } = useSnackbar();

    const [phoneAuthMode] = useState<PhoneAuthMode>("login");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const [
        token,
        bootstrapping,
        bootstrapError,
        loginAsTestUser,
        loginWithPhone,
        registerWithPhone,
    ] = useStore(state => [
        state.token,
        state.bootstrapping,
        state.bootstrapError,
        state.loginAsTestUser,
        state.loginWithPhone,
        state.registerWithPhone,
    ]);

    useEffect(() => {
        // Sau khi dang nhap thanh cong, dieu huong ve trang nguoi dung dinh vao
        // ban dau (RequireAuth luu trong location.state.from) hoac trang chu -
        // truoc day khong co redirect nao ca nen man hinh dang nhap "dung im"
        // sau khi bam nut, trong nhu nut khong hoat dong.
        if (token) {
            const from =
                (location.state as { from?: string } | null)?.from || "/";
            navigate(from, { animate: true, replace: true });
        }
    }, [token]);

    const handleLoginAsTestUser = (zaloUserId: string, name: string) => {
        loginAsTestUser(zaloUserId, name);
    };

    const handlePhoneSubmit = () => {
        if (!isValidVietnamesePhone(phone.trim())) {
            openSnackbar({
                type: "error",
                text: "Số điện thoại không hợp lệ",
            });
            return;
        }
        if (password.length < 6) {
            openSnackbar({
                type: "error",
                text: "Mật khẩu phải có ít nhất 6 ký tự",
            });
            return;
        }
        if (phoneAuthMode === "register") {
            if (!displayName.trim()) {
                openSnackbar({ type: "error", text: "Vui lòng nhập họ tên" });
                return;
            }
            if (password !== confirmPassword) {
                openSnackbar({
                    type: "error",
                    text: "Mật khẩu nhập lại không khớp",
                });
                return;
            }
            registerWithPhone(phone.trim(), password, displayName.trim());
        } else {
            loginWithPhone(phone.trim(), password);
        }
    };

    return (
        <PageLayout
            id="login-page"
            customHeader={
                <DefaultHeader
                    title={
                        phoneAuthMode === "register" ? "Đăng ký" : "Đăng nhập"
                    }
                    back
                    onBackClick={() =>
                        navigate("/", { animate: true, replace: true })
                    }
                />
            }
        >
            <Box
                flex
                flexDirection="column"
                alignItems="center"
                style={{
                    background:
                        "linear-gradient(160deg, #05AAC0 0%, #0891B2 65%, #0E7490 100%)",
                    borderRadius: "0 0 32px 32px",
                    paddingTop: 36,
                    paddingBottom: 56,
                }}
            >
                <img
                    src={Logo}
                    alt="Logo"
                    style={{
                        width: 72,
                        height: 72,
                        filter: "drop-shadow(0 8px 16px rgba(15,23,42,0.25))",
                    }}
                />
                <Text.Title
                    size="large"
                    className="text-white mt-4 text-center"
                >
                    {APP_NAME_DEFAULT}
                </Text.Title>
                <Text size="small" className="text-wth_a70 text-center">
                    Phường Dương Nội, Hà Nội
                </Text>
            </Box>

            <Box p={6} style={{ marginTop: -40 }}>
                {!token && bootstrapError && (
                    <Text
                        size="xSmall"
                        className="text-red-500 mb-3 text-center"
                    >
                        {bootstrapError}
                    </Text>
                )}

                {!token && (
                    <Box className="bg-white rounded-3xl shadow-card p-5 w-full">
                        <Text.Title size="small" className="mb-4">
                            {phoneAuthMode === "register"
                                ? "Đăng ký tài khoản"
                                : "Đăng nhập bằng số điện thoại"}
                        </Text.Title>

                        {phoneAuthMode === "register" && (
                            <Box mt={3}>
                                <Input
                                    label="Họ tên"
                                    value={displayName}
                                    onChange={e =>
                                        setDisplayName(e.target.value)
                                    }
                                />
                            </Box>
                        )}
                        <Box mt={3}>
                            <Input
                                label="Số điện thoại"
                                placeholder="0xxxxxxxxx"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </Box>
                        <Box mt={3}>
                            <Input
                                type="password"
                                label="Mật khẩu"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </Box>
                        {phoneAuthMode === "register" && (
                            <Box mt={3}>
                                <Input
                                    type="password"
                                    label="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={e =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                            </Box>
                        )}

                        <Box mt={4}>
                            <Button
                                fullWidth
                                loading={bootstrapping}
                                onClick={handlePhoneSubmit}
                            >
                                {phoneAuthMode === "register"
                                    ? "Đăng ký"
                                    : "Đăng nhập"}
                            </Button>
                        </Box>

                        <Box
                            flex
                            alignItems="center"
                            mt={4}
                            style={{ gap: 10 }}
                        >
                            <Box
                                style={{ flex: 1, height: 1 }}
                                className="bg-divider_01"
                            />
                            <Text size="xxSmall" className="text-text_3">
                                hoặc
                            </Text>
                            <Box
                                style={{ flex: 1, height: 1 }}
                                className="bg-divider_01"
                            />
                        </Box>

                        <Box mt={3}>
                            <Button
                                fullWidth
                                variant="secondary"
                                onClick={() =>
                                    openSnackbar({
                                        text: "Tính năng đang được phát triển",
                                        type: "info",
                                        duration: 3000,
                                        verticalAction: true,
                                        action: { text: "Đóng", close: true },
                                    })
                                }
                            >
                                Đăng nhập bằng VNeID
                            </Button>
                        </Box>

                        <Text
                            size="xSmall"
                            className="text-main text-center mt-3"
                            onClick={() =>
                                openSnackbar({
                                    type: "info",
                                    text: "Vui lòng liên hệ Tổ trưởng tổ dân phố hoặc UBND phường Dương Nội để được hỗ trợ đặt lại mật khẩu.",
                                    duration: 6000,
                                })
                            }
                        >
                            Quên mật khẩu? Gửi hỗ trợ
                        </Text>
                    </Box>
                )}

                {import.meta.env.DEV && !token && (
                    <Box
                        className="bg-amber-50 rounded-2xl p-4 w-full mt-4"
                        style={{
                            border: "1.5px dashed #FBBF24",
                        }}
                    >
                        <Box flex alignItems="center" style={{ gap: 6 }} mb={2}>
                            <Icon
                                icon="zi-warning-solid"
                                size={15}
                                className="text-amber-600"
                            />
                            <Text
                                size="xSmall"
                                className="text-amber-800 font-semibold"
                            >
                                Tài khoản thử nghiệm (chỉ hiện khi dev)
                            </Text>
                        </Box>
                        <Text size="xxSmall" className="text-amber-700 mb-3">
                            Dùng để kiểm tra giao diện theo từng vai trò mà
                            không cần nhiều tài khoản Zalo thật. Yêu cầu đã chạy
                            `npm run seed` ở backend-app.
                        </Text>
                        <Box flex flexDirection="column" style={{ gap: 8 }}>
                            {DEV_TEST_ACCOUNTS.map(account => (
                                <Button
                                    key={account.zaloUserId}
                                    fullWidth
                                    variant="secondary"
                                    loading={bootstrapping}
                                    onClick={() =>
                                        handleLoginAsTestUser(
                                            account.zaloUserId,
                                            account.name,
                                        )
                                    }
                                    className="!bg-white !text-text_1 !border !border-amber-200"
                                >
                                    {ROLE_LABEL[account.role]} — {account.name}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default LoginPage;
