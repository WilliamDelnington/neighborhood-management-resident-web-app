import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Box, Icon } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
} from "@components/admin";
import { fetchPublicFiles } from "@service/fileApi";
import { FileAsset } from "@dts";

const CATEGORY_LABEL: Record<FileAsset["category"], string> = {
    form: "Biểu mẫu",
    attachment: "Tài liệu đính kèm",
    minutes: "Biên bản",
    other: "Khác",
};

const FilesPage: React.FC = () => {
    const [items, setItems] = useState<FileAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchPublicFiles()
            .then(res => setItems(res.items))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <PageLayout
            id="files-page"
            title="Biểu mẫu"
            bottomNav={<AppBottomNav />}
        >
            <Box
                className="bg-white mt-2"
                style={{ minHeight: "calc(100vh - 112px)" }}
            >
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState
                        label="Chưa có biểu mẫu nào"
                        icon={FileText}
                        tone="primary"
                    />
                )}
                {!loading && !error && (
                    <Box px={4}>
                        {items.map(item => (
                            <ListRow
                                key={item._id}
                                title={item.name}
                                subtitle={
                                    item.description ||
                                    CATEGORY_LABEL[item.category]
                                }
                                right={
                                    <Icon
                                        icon="zi-download"
                                        className="text-main"
                                    />
                                }
                                onClick={() => window.open(item.url, "_blank")}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default FilesPage;
