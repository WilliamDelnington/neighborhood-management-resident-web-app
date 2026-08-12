import React, { useEffect, useState } from "react";
import { Box, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
} from "@components/admin";
import { fetchSurveys } from "@service/surveyApi";
import { Survey } from "@dts";

const SurveyListPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchSurveys(true)
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <PageLayout
            id="survey-list-page"
            title="Khảo sát"
            bottomNav={<AppBottomNav />}
        >
            <Box className="bg-white mt-2">
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Hiện chưa có khảo sát nào đang mở" />
                )}
                {!loading && !error && (
                    <Box px={4}>
                        {items.map(item => (
                            <ListRow
                                key={item._id}
                                title={item.title}
                                subtitle={item.description}
                                onClick={() =>
                                    navigate(`/surveys/${item._id}`, {
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

export default SurveyListPage;
