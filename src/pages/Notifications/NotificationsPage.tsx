import React, { useEffect, useState } from "react";
import { Box, Tabs, Text, useLocation, useNavigate } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button } from "@components/customized";
import { EmptyState, ErrorState, LoadingState } from "@components/admin";
import AnnouncementListView from "@components/announcements/AnnouncementListView";
import {
    fetchMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "@service/notificationApi";
import { formatDateTime } from "@utils/date-time";
import { AppNotification } from "@dts";
import { useStore } from "@store";

/**
 * Cac loai doi tuong lien quan co the dieu huong den man hinh chi tiet tuong ung
 * khi nguoi dung bam vao mot thong bao (giu dong bo voi ten model o backend).
 */
const RELATED_MODEL_PATH: Record<string, string> = {
    Complaint: "/complaints",
    Announcement: "/announcements",
    Meeting: "/meetings",
    Survey: "/surveys",
    HouseRecord: "/admin/houses",
    Correspondence: "/correspondences",
    InspectionTarget: "/inspections/self-declarations",
};

/**
 * Man hinh mo tu bieu tuong chuong tren Home - gop "Thong bao chung" (thong
 * cao cong khai, xem AnnouncementListView) va "Thong bao cua toi" (rieng cho
 * tai khoan da dang nhap) vao hai tab, thay vi hai muc rieng tren danh sach
 * tien ich/thanh dieu huong nhu truoc.
 *
 * Cho phep noi dieu huong chi dinh tab mo dau (vd nut "Xem tat ca" cua khoi
 * "Thong bao moi nhat" tren Home, dang chi hien thong bao chung) qua
 * location.state.tab - giong cach RequireAuth/LoginPage truyen state.from.
 */
const NotificationsPage: React.FC = () => {
    const token = useStore(state => state.token);
    const location = useLocation();
    const initialTab = (location.state as { tab?: string } | null)?.tab;
    const [activeTab, setActiveTab] = useState(
        initialTab ?? (token ? "personal" : "announcements"),
    );

    return (
        <PageLayout id="notifications-page" title="Thông báo">
            <Tabs
                activeKey={activeTab}
                onChange={key => setActiveTab(key)}
                className="bg-white"
            >
                <Tabs.Tab key="personal" label="Của tôi">
                    <PersonalNotificationsTab />
                </Tabs.Tab>
                <Tabs.Tab key="announcements" label="Thông báo chung">
                    <AnnouncementListView />
                </Tabs.Tab>
            </Tabs>
        </PageLayout>
    );
};

const PersonalNotificationsTab: React.FC = () => {
    const navigate = useNavigate();
    const token = useStore(state => state.token);
    const refreshNotificationStatus = useStore(
        state => state.refreshNotificationStatus,
    );
    const markNotificationsSeen = useStore(
        state => state.markNotificationsSeen,
    );
    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchMyNotifications()
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (token) load();
    }, [token]);

    useEffect(() => {
        if (token) markNotificationsSeen();
    }, [token, markNotificationsSeen]);

    if (!token) {
        return (
            <Box
                flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={6}
            >
                <Text size="xSmall" className="text-text_2 mb-3 text-center">
                    Đăng nhập để xem thông báo của bạn
                </Text>
                <Button
                    fullWidth
                    onClick={() => navigate("/login", { animate: true })}
                >
                    Đăng nhập
                </Button>
            </Box>
        );
    }

    const handleOpen = (item: AppNotification) => {
        if (!item.readAt) {
            markNotificationRead(item.deliveryId)
                .then(() => refreshNotificationStatus())
                .catch(() => undefined);
            setItems(prev =>
                prev.map(n =>
                    n.deliveryId === item.deliveryId
                        ? { ...n, readAt: new Date().toISOString() }
                        : n,
                ),
            );
        }
        const { relatedModel, relatedId } = item.notification;
        const basePath = relatedModel
            ? RELATED_MODEL_PATH[relatedModel]
            : undefined;
        if (basePath && relatedId) {
            navigate(`${basePath}/${relatedId}`, { animate: true });
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await markAllNotificationsRead();
            setItems(prev =>
                prev.map(n => ({
                    ...n,
                    readAt: n.readAt || new Date().toISOString(),
                })),
            );
            refreshNotificationStatus();
        } catch {
            // Bo qua loi mang - nguoi dung co the bam lai
        } finally {
            setMarkingAll(false);
        }
    };

    const hasUnread = items.some(item => !item.readAt);

    return (
        <Box className="bg-white">
            {hasUnread && (
                <Box flex justifyContent="flex-end" p={3}>
                    <Text
                        size="xSmall"
                        className="text-main"
                        onClick={markingAll ? undefined : handleMarkAllRead}
                    >
                        {markingAll
                            ? "Đang xử lý..."
                            : "Đánh dấu tất cả đã đọc"}
                    </Text>
                </Box>
            )}
            {loading && <LoadingState />}
            {!loading && error && <ErrorState onRetry={load} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState label="Bạn chưa có thông báo nào" />
            )}
            {!loading && !error && (
                <Box px={4}>
                    {items.map(item => (
                        <Box
                            key={item.deliveryId}
                            py={3}
                            flex
                            alignItems="flex-start"
                            style={{ gap: 8 }}
                            className="border-b border-divider_01 last:border-0"
                            onClick={() => handleOpen(item)}
                        >
                            <Box
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    marginTop: 6,
                                    flexShrink: 0,
                                }}
                                className={item.readAt ? "" : "bg-main"}
                            />
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                    size="small"
                                    className={
                                        item.readAt
                                            ? "font-normal"
                                            : "font-medium"
                                    }
                                >
                                    {item.notification.title}
                                </Text>
                                <Text
                                    size="xxSmall"
                                    className="text-text_2 mt-1"
                                >
                                    {item.notification.body}
                                </Text>
                                <Text
                                    size="xxSmall"
                                    className="text-text_3 mt-1"
                                >
                                    {formatDateTime(
                                        new Date(
                                            item.sentAt ||
                                                item.notification.createdAt,
                                        ),
                                    )}
                                </Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default NotificationsPage;
