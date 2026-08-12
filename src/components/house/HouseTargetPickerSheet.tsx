import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { searchHouseTargets } from "@service/houseApi";
import { HouseLookupItem } from "@dts";

export interface HouseTargetPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (house: HouseLookupItem) => void;
}

/**
 * Sheet chon "nha so lien quan" khi gui phan anh - KHONG gioi han theo
 * ownerId/assignedClusters nhu HousePickerSheet (nguoi gui co the bao ve mot
 * nha khong phai cua ho, vd nha hang xom), dung searchHouseTargets thay vi
 * fetchHouses - xem GET /api/houses/lookup o backend.
 */
const HouseTargetPickerSheet: React.FC<HouseTargetPickerSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<HouseLookupItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            searchHouseTargets(search || undefined)
                .then(setItems)
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
            title="Chọn nhà số liên quan"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo mã nhà hoặc địa chỉ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && items.length === 0 && (
                        <EmptyState label="Không tìm thấy nhà số phù hợp" />
                    )}
                    {!loading &&
                        items.map(house => (
                            <Box
                                key={house._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(house);
                                    onClose();
                                }}
                            >
                                <Text size="small" bold>
                                    {house.code}
                                    {house.address ? ` — ${house.address}` : ""}
                                </Text>
                                {house.cluster && (
                                    <Text size="xSmall" className="text-text_2">
                                        Cụm {house.cluster}
                                    </Text>
                                )}
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default HouseTargetPickerSheet;
