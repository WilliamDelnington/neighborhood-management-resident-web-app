import React, { useEffect, useState } from "react";
import { Box, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
} from "@components/admin";
import { fetchMeetings } from "@service/meetingApi";
import { formatDateTime } from "@utils/date-time";
import { Meeting } from "@dts";
import { useStore } from "@store";

const FILTERS: { key: "upcoming" | "all"; label: string }[] = [
    { key: "upcoming", label: "Sắp tới" },
    { key: "all", label: "Tất cả" },
];

const MeetingListPage: React.FC = () => {
    const navigate = useNavigate();
    const markMeetingsSeen = useStore(state => state.markMeetingsSeen);
    const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
    const [items, setItems] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchMeetings(filter === "upcoming")
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, [filter]);

    useEffect(() => {
        markMeetingsSeen();
    }, [markMeetingsSeen]);

    return (
        <PageLayout
            id="meeting-list-page"
            title="Lịch họp"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4} pb={0} flex style={{ gap: 8 }}>
                {FILTERS.map(f => (
                    <Box
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={
                            filter === f.key
                                ? "bg-main text-white"
                                : "bg-white text-text_2"
                        }
                        style={{
                            padding: "6px 16px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        {f.label}
                    </Box>
                ))}
            </Box>

            <Box className="bg-white mt-3">
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Chưa có cuộc họp nào" />
                )}
                {!loading && !error && (
                    <Box px={4}>
                        {items.map(item => (
                            <ListRow
                                key={item._id}
                                title={item.title}
                                subtitle={`${formatDateTime(
                                    new Date(item.startTime),
                                )} • ${item.location}`}
                                onClick={() =>
                                    navigate(`/meetings/${item._id}`, {
                                        animate: true,
                                    })
                                }
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default MeetingListPage;
