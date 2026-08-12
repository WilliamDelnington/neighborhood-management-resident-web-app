import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState, ErrorState } from "@components/admin";
import { fetchBusinessTypes } from "@service/businessTypeApi";
import { AppError, BusinessType } from "@dts";

export interface BusinessTypePickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (businessType: BusinessType) => void;
}

const BusinessTypePickerSheet: React.FC<BusinessTypePickerSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        setError(null);
        fetchBusinessTypes({ search: search || undefined, active: true })
            .then(res => setItems(res.items))
            .catch(err => setError((err as AppError).message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(load, 300);
        // eslint-disable-next-line consistent-return
        return () => clearTimeout(timer);
    }, [visible, search]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Chọn loại hình kinh doanh"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo tên loại hình..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && error && (
                        <ErrorState label={error} onRetry={load} />
                    )}
                    {!loading && !error && items.length === 0 && (
                        <EmptyState label="Không tìm thấy loại hình phù hợp" />
                    )}
                    {!loading &&
                        !error &&
                        items.map(businessType => (
                            <Box
                                key={businessType._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(businessType);
                                    onClose();
                                }}
                            >
                                <Text size="small" bold>
                                    {businessType.name}
                                </Text>
                                {businessType.description && (
                                    <Text size="xSmall" className="text-text_2">
                                        {businessType.description}
                                    </Text>
                                )}
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default BusinessTypePickerSheet;
