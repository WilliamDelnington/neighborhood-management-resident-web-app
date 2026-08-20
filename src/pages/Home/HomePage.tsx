import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { HomeHeader, AppBottomNav, PageLayout } from "@components/layout";
import { StatusBadge } from "@components/admin";
import {
    HomeInfoBanner,
    EmergencyContactBox,
    ContactInfoBox,
    FeaturesCard,
    UtilityAppsRow,
    TaskSummaryGrid,
    MyRequestsPreview,
} from "@components/home";
import { hasPermission } from "@components/role";
import {
    APP_UTINITIES,
    MORE_FEATURES,
    EMERGENCY_HOTLINES,
    MiniAppFeatureConfigEntry,
    resolveFeatureOrder,
} from "@constants/utinities";
import { fetchPublicAnnouncements } from "@service/announcementApi";
import { fetchPublicNews } from "@service/newsApi";
import { fetchPublicSettings } from "@service/settingsApi";
import { fetchMyDashboard } from "@service/dashboardApi";
import { fetchMyHouses } from "@service/myHouseApi";
import {
    LOAI_THONG_BAO_LABEL,
    LOAI_THONG_BAO_TONE,
    LOAI_TIN_TUC_LABEL,
    LOAI_TIN_TUC_TONE,
    HOUSE_STATUS_LABEL,
    APP_NAME_DEFAULT,
    APP_NAME_HOUSE_OWNER,
} from "@constants/domain";
import { resolveAssetUrl } from "@constants/common";
import {
    Announcement,
    MyHouseDashboard,
    MyHouseOverviewItem,
    News,
} from "@dts";
import { useStore } from "@store";

const HomePage: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const hasUnreadMeetingNotification = useStore(
        state => state.hasUnreadMeetingNotification,
    );
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<News[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [featureConfig, setFeatureConfig] = useState<
        MiniAppFeatureConfigEntry[] | undefined
    >(undefined);
    const [dashboard, setDashboard] = useState<MyHouseDashboard | null>(null);
    const [myHouse, setMyHouse] = useState<MyHouseOverviewItem | null>(null);

    const appName =
        user?.primaryRole === "house_owner"
            ? APP_NAME_HOUSE_OWNER
            : APP_NAME_DEFAULT;

    const features = resolveFeatureOrder(
        [...APP_UTINITIES, ...MORE_FEATURES],
        featureConfig,
    )
        .filter(
            item =>
                !item.requiredPermission ||
                hasPermission(user, item.requiredPermission),
        )
        .map(item => ({
            ...item,
            showBadge:
                item.key === "meetings"
                    ? hasUnreadMeetingNotification
                    : undefined,
        }));

    useEffect(() => {
        fetchPublicAnnouncements(1, 3)
            .then(res => setAnnouncements(res.items))
            .catch(() => setAnnouncements([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPublicNews(1, 3)
            .then(res => setNews(res.items))
            .catch(() => setNews([]))
            .finally(() => setNewsLoading(false));
    }, []);

    useEffect(() => {
        if (!user) {
            setDashboard(null);
            setMyHouse(null);
            return;
        }
        fetchMyDashboard()
            .then(setDashboard)
            .catch(() => setDashboard(null));
        fetchMyHouses()
            .then(items => setMyHouse(items[0] ?? null))
            .catch(() => setMyHouse(null));
    }, [user]);

    useEffect(() => {
        fetchPublicSettings()
            .then(settings =>
                setFeatureConfig(
                    settings.mini_app_features as
                        | MiniAppFeatureConfigEntry[]
                        | undefined,
                ),
            )
            .catch(() => setFeatureConfig(undefined));
    }, []);

    const primaryOwnership = myHouse?.ownerships.find(
        o => o.active && o.relationshipType === "primary_owner",
    ) ?? myHouse?.ownerships.find(o => o.active);

    return (
        <PageLayout
            id="home-page"
            customHeader={<HomeHeader title={appName} />}
            bottomNav={<AppBottomNav />}
        >
            <HomeInfoBanner
                title={appName}
                address="Phường Dương Nội, TP Hà Nội"
                house={
                    myHouse
                        ? {
                              code: myHouse.house.code,
                              address: myHouse.house.address,
                              statusLabel:
                                  HOUSE_STATUS_LABEL[myHouse.house.status],
                              verified: myHouse.house.status === "verified",
                              ownerName: primaryOwnership?.ownerDisplayName,
                          }
                        : undefined
                }
                onViewDetail={
                    myHouse ? () => navigate("/house/mine") : undefined
                }
            />

            {dashboard && (
                <Box className="bg-white mt-2 p-4">
                    <Text.Title size="small" className="mb-3">
                        Việc cần xử lý
                    </Text.Title>
                    <TaskSummaryGrid dashboard={dashboard} />
                </Box>
            )}

            <FeaturesCard features={features} />

            {user && <MyRequestsPreview />}

            <Box className="bg-white mt-2 p-4">
                <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Text.Title size="small">Thông báo mới nhất</Text.Title>
                    <Text
                        size="xSmall"
                        className="text-main"
                        onClick={() =>
                            navigate("/notifications", {
                                animate: true,
                                state: { tab: "announcements" },
                            })
                        }
                    >
                        Xem tất cả
                    </Text>
                </Box>

                {!loading && announcements.length === 0 && (
                    <Text size="xSmall" className="text-text_2">
                        Chưa có thông báo nào.
                    </Text>
                )}

                {announcements.map(item => (
                    <Box
                        key={item._id}
                        py={2}
                        className="border-b border-divider_01 last:border-0"
                        onClick={() =>
                            navigate(`/announcements/${item._id}`, {
                                animate: true,
                            })
                        }
                    >
                        <Box
                            flex
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <StatusBadge
                                label={LOAI_THONG_BAO_LABEL[item.category]}
                                tone={LOAI_THONG_BAO_TONE[item.category]}
                            />
                            <Text size="xxSmall" className="text-text_3">
                                {new Date(item.createdAt).toLocaleDateString(
                                    "vi-VN",
                                )}
                            </Text>
                        </Box>
                        <Text size="small" className="font-medium mt-1">
                            {item.isUrgent ? "🔴 " : ""}
                            {item.pinned ? "📌 " : ""}
                            {item.title}
                        </Text>
                    </Box>
                ))}
            </Box>

            <Box className="bg-white mt-2 p-4">
                <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Text.Title size="small">Tin tức mới nhất</Text.Title>
                    <Text
                        size="xSmall"
                        className="text-main"
                        onClick={() =>
                            navigate("/news", { animate: true })
                        }
                    >
                        Xem tất cả
                    </Text>
                </Box>

                {!newsLoading && news.length === 0 && (
                    <Text size="xSmall" className="text-text_2">
                        Chưa có tin tức nào.
                    </Text>
                )}

                {news.map(item => (
                    <Box
                        key={item._id}
                        flex
                        py={2}
                        style={{ gap: 8 }}
                        className="border-b border-divider_01 last:border-0"
                        onClick={() =>
                            navigate(`/news/${item._id}`, { animate: true })
                        }
                    >
                        {item.coverImageUrl && (
                            <img
                                src={resolveAssetUrl(item.coverImageUrl)}
                                alt=""
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <StatusBadge
                                label={LOAI_TIN_TUC_LABEL[item.category]}
                                tone={LOAI_TIN_TUC_TONE[item.category]}
                            />
                            <Text size="small" className="font-medium mt-1">
                                {item.pinned ? "📌 " : ""}
                                {item.title}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Box>

            <UtilityAppsRow />

            <EmergencyContactBox hotlines={EMERGENCY_HOTLINES} />

            <ContactInfoBox
                title="Thông tin liên hệ tổ dân phố"
                description="Tổ trưởng tổ dân phố, phường Dương Nội, TP Hà Nội"
            />
        </PageLayout>
    );
};

export default HomePage;
