import React, { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Box, useNavigate } from "@components/ui";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
} from "@components/admin";
import { fetchPublicAnnouncements } from "@service/announcementApi";
import { LOAI_THONG_BAO_LABEL } from "@constants/domain";
import { Announcement } from "@dts";

const AnnouncementListView: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchPublicAnnouncements()
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <Box className="bg-white mt-2" style={{ minHeight: "60vh" }}>
            {loading && <LoadingState />}
            {!loading && error && <ErrorState onRetry={load} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState
                    label="Chưa có thông báo nào"
                    icon={Megaphone}
                    tone="primary"
                />
            )}
            {!loading && !error && (
                <Box px={4}>
                    {items.map(item => {
                        const source =
                            item.neighborhoodId &&
                            typeof item.neighborhoodId !== "string"
                                ? `Tổ dân phố ${item.neighborhoodId.name}`
                                : "Phường";
                        return (
                            <ListRow
                                key={item._id}
                                title={`${item.isUrgent ? "🔴 " : ""}${
                                    item.pinned ? "📌 " : ""
                                }${item.title}`}
                                subtitle={`${
                                    LOAI_THONG_BAO_LABEL[item.category]
                                } · ${source}`}
                                onClick={() =>
                                    navigate(`/announcements/${item._id}`, {
                                        animate: true,
                                    })
                                }
                            />
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default AnnouncementListView;
