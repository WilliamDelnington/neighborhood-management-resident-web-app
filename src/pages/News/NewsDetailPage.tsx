import React, { useEffect, useState } from "react";
import { Box, Text, useParams } from "@components/ui";
import { PageLayout } from "@components/layout";
import { ErrorState, LoadingState } from "@components/admin";
import { fetchNewsDetail } from "@service/newsApi";
import { LOAI_TIN_TUC_LABEL } from "@constants/domain";
import { resolveAssetUrl } from "@constants/common";
import { formatDateTime } from "@utils/date-time";
import { News } from "@dts";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchNewsDetail(id)
            .then(setNews)
            .catch(err =>
                setErrorMessage(err?.message || "Không thể tải tin tức"),
            )
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    return (
        <PageLayout id="news-detail-page" title="Tin tức">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && news && (
                    <Box className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        {news.coverImageUrl && (
                            <img
                                src={resolveAssetUrl(news.coverImageUrl)}
                                alt=""
                                style={{
                                    width: "100%",
                                    height: 200,
                                    objectFit: "cover",
                                }}
                            />
                        )}
                        <Box p={4}>
                            <Text
                                size="xxSmall"
                                className="text-main font-medium"
                            >
                                {LOAI_TIN_TUC_LABEL[news.category]}
                            </Text>
                            <Text.Title size="small" className="mt-1">
                                {news.pinned ? "📌 " : ""}
                                {news.title}
                            </Text.Title>
                            <Text size="xxSmall" className="text-text_2 mt-1">
                                {news.publishedAt
                                    ? `Đăng lúc ${formatDateTime(
                                          new Date(news.publishedAt),
                                      )}`
                                    : `Tạo lúc ${formatDateTime(
                                          new Date(news.createdAt),
                                      )}`}
                            </Text>
                            <Text
                                size="small"
                                className="mt-3 whitespace-pre-line"
                            >
                                {news.content}
                            </Text>

                            {news.images.length > 0 && (
                                <Box
                                    className="mt-4"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(3, 1fr)",
                                        gap: 8,
                                    }}
                                >
                                    {news.images.map(url => (
                                        <img
                                            key={url}
                                            src={resolveAssetUrl(url)}
                                            alt=""
                                            style={{
                                                width: "100%",
                                                height: 96,
                                                borderRadius: 8,
                                                objectFit: "cover",
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default NewsDetailPage;
