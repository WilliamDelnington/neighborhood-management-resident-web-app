import React, { useEffect, useState } from "react";
import { Box, Text, useParams } from "@components/ui";
import { PageLayout } from "@components/layout";
import { ErrorState, LoadingState } from "@components/admin";
import { fetchAnnouncementDetail } from "@service/announcementApi";
import { LOAI_THONG_BAO_LABEL } from "@constants/domain";
import { formatDateTime } from "@utils/date-time";
import { Announcement } from "@dts";

const AnnouncementDetailPage: React.FC = () => {
    const { id } = useParams();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchAnnouncementDetail(id)
            .then(setAnnouncement)
            .catch(err =>
                setErrorMessage(err?.message || "Không thể tải thông báo"),
            )
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    return (
        <PageLayout id="announcement-detail-page" title="Thông báo">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && announcement && (
                    <Box className="bg-white rounded-2xl p-4 shadow-card">
                        <Text size="xxSmall" className="text-main font-medium">
                            {LOAI_THONG_BAO_LABEL[announcement.category]}
                            {" · "}
                            {announcement.neighborhoodId &&
                            typeof announcement.neighborhoodId !== "string"
                                ? `Tổ dân phố ${announcement.neighborhoodId.name}`
                                : "Phường"}
                        </Text>
                        {announcement.isUrgent && (
                            <Text
                                size="xxSmall"
                                className="text-red-600 font-medium mt-1"
                            >
                                🔴 Thông báo khẩn cấp
                            </Text>
                        )}
                        <Text.Title size="small" className="mt-1">
                            {announcement.pinned ? "📌 " : ""}
                            {announcement.title}
                        </Text.Title>
                        <Text size="xxSmall" className="text-text_2 mt-1">
                            {announcement.publishedAt
                                ? `Đăng lúc ${formatDateTime(
                                      new Date(announcement.publishedAt),
                                  )}`
                                : `Tạo lúc ${formatDateTime(
                                      new Date(announcement.createdAt),
                                  )}`}
                        </Text>
                        <Text size="small" className="mt-3 whitespace-pre-line">
                            {announcement.content}
                        </Text>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default AnnouncementDetailPage;
