import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { fetchNeighborhoods } from "@service/neighborhoodApi";
import { Neighborhood } from "@dts";

export interface NeighborhoodPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (neighborhood: Neighborhood) => void;
}

const NeighborhoodPickerSheet: React.FC<NeighborhoodPickerSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Neighborhood[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            fetchNeighborhoods({ search: search || undefined, active: true })
                .then(res => setItems(res.items))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        }, 300);
        // eslint-disable-next-line consistent-return
        return () => clearTimeout(timer);
    }, [visible, search]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Chọn tổ dân phố"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo tên tổ dân phố..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && items.length === 0 && (
                        <EmptyState label="Chưa có tổ dân phố nào" />
                    )}
                    {!loading &&
                        items.map(neighborhood => (
                            <Box
                                key={neighborhood._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(neighborhood);
                                    onClose();
                                }}
                            >
                                <Text size="small">{neighborhood.name}</Text>
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default NeighborhoodPickerSheet;
