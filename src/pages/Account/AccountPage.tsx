import React, { useEffect, useState } from "react";
import {
    Box,
    Icon,
    Text,
    useNavigate,
    useSnackbar,
    Switch,
} from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button, Input } from "@components/customized";
import { RequireAuth } from "@components/role";
import { useStore } from "@store";
import {
    updateMyProfile,
    setPassword as setPasswordApi,
    logout as logoutApi,
} from "@service/authApi";
import { fetchUnreadNotificationCount } from "@service/notificationApi";
import { requestNotificationPermission } from "@service/zalo";
import { ROLE_LABEL } from "@constants/domain";
import {
    createChangeRequest,
    fetchMyChangeRequests,
} from "@service/changeRequestApi";
import { ChangeRequest } from "@dts";

const AccountPage: React.FC = () => (
    <RequireAuth>
        <AccountPageContent />
    </RequireAuth>
);

const AccountPageContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const [user, setUser, logout] = useStore(state => [
        state.user,
        state.setUser,
        state.logout,
    ]);

    const [editing, setEditing] = useState(false);
    const [email, setEmail] = useState(user?.email || "");
    const [address, setAddress] = useState(user?.address || "");
    const [saving, setSaving] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [settingPassword, setSettingPassword] = useState(false);

    const [requestingNameChange, setRequestingNameChange] = useState(false);
    const [nameRequest, setNameRequest] = useState("");
    const [nameRequestReason, setNameRequestReason] = useState("");
    const [sendingNameRequest, setSendingNameRequest] = useState(false);
    const [pendingNameRequest, setPendingNameRequest] =
        useState<ChangeRequest | null>(null);

    useEffect(() => {
        fetchUnreadNotificationCount()
            .then(res => setUnreadCount(res.count))
            .catch(() => setUnreadCount(0));
    }, []);

    useEffect(() => {
        fetchMyChangeRequests(1, 20, "pending")
            .then(res =>
                setPendingNameRequest(
                    res.items.find(r => r.targetModel === "User") || null,
                ),
            )
            .catch(() => setPendingNameRequest(null));
    }, []);

    if (!user) return null;

    const handleSave = async () => {
        try {
            setSaving(true);
            const updated = await updateMyProfile({
                email,
                address,
            });
            setUser(updated);
            setEditing(false);
            openSnackbar({ type: "success", text: "Đã cập nhật tài khoản" });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRequestNameChange = async () => {
        if (!nameRequest.trim()) {
            openSnackbar({ type: "error", text: "Vui lòng nhập họ tên mới" });
            return;
        }
        try {
            setSendingNameRequest(true);
            const created = await createChangeRequest({
                targetModel: "User",
                targetId: user.id,
                changeType: "update",
                patch: { displayName: nameRequest.trim() },
                reason: nameRequestReason.trim() || undefined,
            });
            setPendingNameRequest(created);
            setRequestingNameChange(false);
            setNameRequest("");
            setNameRequestReason("");
            openSnackbar({
                type: "success",
                text: "Đã gửi yêu cầu đổi tên, chờ duyệt",
            });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSendingNameRequest(false);
        }
    };

    const handleToggleNotification = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { checked } = e.target;
        if (checked) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                openSnackbar({
                    type: "error",
                    text: "Bạn chưa cấp quyền thông báo",
                });
                return;
            }
        }
        try {
            const updated = await updateMyProfile({
                notificationPermission: checked,
            });
            setUser(updated);
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        }
    };

    const handleSetPassword = async () => {
        if (newPassword.length < 6) {
            openSnackbar({
                type: "error",
                text: "Mật khẩu phải có ít nhất 6 ký tự",
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
            setSettingPassword(true);
            await setPasswordApi(newPassword, currentPassword || undefined);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setChangingPassword(false);
            openSnackbar({
                type: "success",
                text: "Đã đặt mật khẩu đăng nhập",
            });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSettingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            // Bo qua loi mang - van xoa session cuc bo
        }
        logout();
        navigate("/login", { animate: true });
    };

    return (
        <PageLayout
            id="account-page"
            title="Tài khoản"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                <Box
                    className="bg-white rounded-2xl p-4 shadow-card"
                    flex
                    flexDirection="column"
                    alignItems="center"
                >
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                            }}
                        />
                    ) : (
                        <Box
                            className="bg-blue_10 text-main"
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 28,
                                fontWeight: 600,
                            }}
                        >
                            {user.displayName?.charAt(0)?.toUpperCase() || "?"}
                        </Box>
                    )}
                    <Text.Title size="small" className="mt-2">
                        {user.displayName}
                    </Text.Title>
                    <Text
                        size="xxSmall"
                        className="text-primary-700 bg-primary-50 font-semibold mt-1"
                        style={{
                            padding: "3px 10px",
                            borderRadius: 99,
                            display: "inline-block",
                        }}
                    >
                        {ROLE_LABEL[user.primaryRole]}
                    </Text>
                </Box>

                <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Text.Title size="small">Thông tin cá nhân</Text.Title>
                        {!editing && (
                            <Text
                                size="xSmall"
                                className="text-main"
                                onClick={() => setEditing(true)}
                            >
                                Chỉnh sửa
                            </Text>
                        )}
                    </Box>

                    {editing ? (
                        <>
                            <Box mt={3}>
                                <Input
                                    label="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </Box>
                            <Box mt={3}>
                                <Input
                                    label="Địa chỉ"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                />
                            </Box>
                            <Box mt={4} flex style={{ gap: 8 }}>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => setEditing(false)}
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
                                label="Số điện thoại"
                                value={user.phone || "Chưa cập nhật"}
                            />
                            <InfoRow
                                label="Email"
                                value={user.email || "Chưa cập nhật"}
                            />
                            <InfoRow
                                label="Địa chỉ"
                                value={user.address || "Chưa cập nhật"}
                            />
                            <InfoRow
                                label="Hộ khẩu liên kết"
                                value={
                                    user.householdId
                                        ? "Đã liên kết"
                                        : "Chưa liên kết"
                                }
                            />
                        </>
                    )}
                </Box>

                <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="center"
                        mb={pendingNameRequest || requestingNameChange ? 2 : 0}
                    >
                        <Box>
                            <Text.Title size="small">Họ tên</Text.Title>
                            <Text size="xxSmall" className="text-text_2">
                                {user.displayName}
                            </Text>
                        </Box>
                        {!requestingNameChange && !pendingNameRequest && (
                            <Text
                                size="xSmall"
                                className="text-main"
                                onClick={() => {
                                    setNameRequest(user.displayName);
                                    setRequestingNameChange(true);
                                }}
                            >
                                Yêu cầu đổi tên
                            </Text>
                        )}
                    </Box>

                    {pendingNameRequest && !requestingNameChange && (
                        <Text size="xxSmall" className="text-text_2">
                            Yêu cầu đổi tên thành &quot;
                            {String(
                                pendingNameRequest.patch?.displayName || "",
                            )}
                            &quot; đang chờ duyệt.
                        </Text>
                    )}

                    {requestingNameChange && (
                        <>
                            <Box mt={3}>
                                <Input
                                    label="Họ tên mới"
                                    value={nameRequest}
                                    onChange={e =>
                                        setNameRequest(e.target.value)
                                    }
                                />
                            </Box>
                            <Box mt={3}>
                                <Input
                                    label="Lý do (không bắt buộc)"
                                    value={nameRequestReason}
                                    onChange={e =>
                                        setNameRequestReason(e.target.value)
                                    }
                                />
                            </Box>
                            <Box mt={4} flex style={{ gap: 8 }}>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() =>
                                        setRequestingNameChange(false)
                                    }
                                >
                                    Hủy
                                </Button>
                                <Button
                                    fullWidth
                                    loading={sendingNameRequest}
                                    onClick={handleRequestNameChange}
                                >
                                    Gửi yêu cầu
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>

                <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="center"
                        mb={changingPassword ? 2 : 0}
                    >
                        <Box>
                            <Text.Title size="small">Bảo mật</Text.Title>
                            <Text size="xxSmall" className="text-text_2">
                                {user.phone
                                    ? "Đăng nhập bằng số điện thoại + mật khẩu"
                                    : "Đặt mật khẩu để có thể đăng nhập bằng số điện thoại"}
                            </Text>
                        </Box>
                        {!changingPassword && (
                            <Text
                                size="xSmall"
                                className="text-main"
                                onClick={() => setChangingPassword(true)}
                            >
                                Đặt mật khẩu
                            </Text>
                        )}
                    </Box>

                    {changingPassword && (
                        <>
                            <Box mt={3}>
                                <Input
                                    type="password"
                                    label="Mật khẩu hiện tại"
                                    value={currentPassword}
                                    onChange={e =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />
                            </Box>
                            <Box mt={3}>
                                <Input
                                    type="password"
                                    label="Mật khẩu mới"
                                    value={newPassword}
                                    onChange={e =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                            </Box>
                            <Box mt={3}>
                                <Input
                                    type="password"
                                    label="Nhập lại mật khẩu mới"
                                    value={confirmNewPassword}
                                    onChange={e =>
                                        setConfirmNewPassword(e.target.value)
                                    }
                                />
                            </Box>
                            <Box mt={4} flex style={{ gap: 8 }}>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmNewPassword("");
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    fullWidth
                                    loading={settingPassword}
                                    onClick={handleSetPassword}
                                >
                                    Lưu
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>

                <Text
                    size="xxSmall"
                    className="text-text_2 font-bold mt-4 mb-2 ml-1"
                    style={{ letterSpacing: 0.4 }}
                >
                    HOẠT ĐỘNG &amp; HỖ TRỢ
                </Text>
                <Box className="bg-white rounded-2xl px-4 shadow-card">
                    <MenuRow
                        icon="zi-notif"
                        label="Thông báo của tôi"
                        onClick={() =>
                            navigate("/notifications", { animate: true })
                        }
                        right={
                            unreadCount > 0 ? (
                                <Box
                                    flex
                                    alignItems="center"
                                    style={{ gap: 8 }}
                                >
                                    <Box
                                        className="bg-red-500 text-white"
                                        style={{
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            fontSize: 11,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "0 6px",
                                        }}
                                    >
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </Box>
                                    <Icon
                                        icon="zi-chevron-right"
                                        className="text-text_3"
                                    />
                                </Box>
                            ) : undefined
                        }
                    />
                    <MenuRow
                        icon="zi-task"
                        label="Nhiệm vụ của tôi"
                        onClick={() =>
                            navigate("/requests/mine", { animate: true })
                        }
                    />
                    <MenuRow
                        icon="zi-edit"
                        label="Yêu cầu thay đổi thông tin của tôi"
                        onClick={() =>
                            navigate("/change-requests/mine", {
                                animate: true,
                            })
                        }
                    />
                    <MenuRow
                        icon="zi-help"
                        label="Hỗ trợ"
                        onClick={() => navigate("/support", { animate: true })}
                    />
                    <MenuRow
                        icon="zi-clock-1"
                        label="Lịch sử tương tác"
                        onClick={() =>
                            navigate("/account/history", { animate: true })
                        }
                    />
                    <MenuRow
                        icon="zi-notif"
                        label="Nhận thông báo"
                        right={
                            <Switch
                                checked={user.notificationPermission}
                                onChange={handleToggleNotification}
                            />
                        }
                    />
                </Box>

                <Box mt={4}>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </Button>
                </Box>
            </Box>
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
        <Text size="xSmall">{value}</Text>
    </Box>
);

const MenuRow: React.FC<{
    icon: string;
    label: string;
    onClick?: () => void;
    right?: React.ReactNode;
}> = ({ icon, label, onClick, right }) => (
    <Box
        flex
        alignItems="center"
        py={3}
        className="border-b border-divider_01 last:border-0"
        style={{ gap: 12 }}
        onClick={onClick}
    >
        <Box
            flex
            alignItems="center"
            justifyContent="center"
            className="bg-primary-50 text-primary-600"
            style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }}
        >
            <Icon icon={icon} size={17} />
        </Box>
        <Text size="small" className="font-medium" style={{ flex: 1 }}>
            {label}
        </Text>
        {right !== undefined
            ? right
            : onClick && (
                  <Icon icon="zi-chevron-right" className="text-text_3" />
              )}
    </Box>
);

export default AccountPage;
