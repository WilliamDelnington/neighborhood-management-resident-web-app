import React, { useEffect, useState } from "react";
import { Box, useNavigate } from "@components/ui";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
} from "@components/admin";
import { fetchPublicNews } from "@service/newsApi";
import { LOAI_TIN_TUC_LABEL } from "@constants/domain";
import { resolveAssetUrl } from "@constants/common";
import { News } from "@dts";

const NewsListView: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchPublicNews()
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <Box className="bg-white mt-2">
            {loading && <LoadingState />}
            {!loading && error && <ErrorState onRetry={load} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState label="Chưa có tin tức nào" />
            )}
            {!loading && !error && (
                <Box px={4}>
                    {items.map(item => (
                        <ListRow
                            key={item._id}
                            title={`${item.pinned ? "📌 " : ""}${item.title}`}
                            subtitle={LOAI_TIN_TUC_LABEL[item.category]}
                            right={
                                item.coverImageUrl ? (
                                    <img
                                        src={resolveAssetUrl(
                                            item.coverImageUrl,
                                        )}
                                        alt=""
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 8,
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : undefined
                            }
                            onClick={() =>
                                navigate(`/news/${item._id}`, {
                                    animate: true,
                                })
                            }
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default NewsListView;
