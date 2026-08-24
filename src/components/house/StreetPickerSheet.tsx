import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { fetchStreets } from "@service/streetApi";
import { Street } from "@dts";

export interface StreetPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (street: Street) => void;
}

/**
 * Sheet chon duong/pho (danh sach chinh thuc, xem streetApi.ts) de gan
 * streetId cho nha so, doc lap voi to dan pho (neighborhoodId) - mot duong/pho
 * co the chay qua nhieu to dan pho nen hai lua chon nay khong rang buoc nhau
 * (xem models/HouseRecord.ts o backend).
 */
const StreetPickerSheet: React.FC<StreetPickerSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Street[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            fetchStreets({ search: search || undefined, active: true })
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
            title="Chọn đường/phố"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo tên đường/phố..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && items.length === 0 && (
                        <EmptyState
                            label="Chưa có đường/phố nào"
                            icon={MapPin}
                            tone="primary"
                        />
                    )}
                    {!loading &&
                        items.map(street => (
                            <Box
                                key={street._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(street);
                                    onClose();
                                }}
                            >
                                <Text size="small">{street.name}</Text>
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default StreetPickerSheet;
