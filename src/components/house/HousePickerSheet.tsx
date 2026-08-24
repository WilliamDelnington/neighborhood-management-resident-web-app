import React, { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { fetchHouses } from "@service/houseApi";
import { House, HouseStatus } from "@dts";

export interface HousePickerSheetProps {
    visible: boolean;
    cluster?: string;
    status?: HouseStatus | HouseStatus[];
    onClose: () => void;
    onSelect: (house: House) => void;
}

/**
 * Sheet chon nha so, dung cho HouseholdForm gan hộ dân vao mot nha. Backend tu
 * gioi han danh sach theo ownerId (house_owner) hoac assignedClusters (nhan
 * vien) cua nguoi goi (xem houseScopeFilter), nen house_owner chi thay nha
 * cua chinh minh.
 */
const HousePickerSheet: React.FC<HousePickerSheetProps> = ({
    visible,
    cluster,
    status,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<House[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            fetchHouses({ search: search || undefined, cluster, status })
                .then(res => setItems(res.items))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        }, 300);
        // eslint-disable-next-line consistent-return
        return () => clearTimeout(timer);
    }, [visible, search, cluster, status]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Chọn nhà số"
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
                        <EmptyState
                            label={
                                status
                                    ? "Bạn chưa có nhà số nào ở trạng thái phù hợp (chưa bị từ chối hoặc bị khóa)"
                                    : "Không tìm thấy nhà số phù hợp"
                            }
                            icon={Home}
                            tone="primary"
                        />
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
                                    {house.code} — {house.address}
                                </Text>
                                <Text size="xSmall" className="text-text_2">
                                    Cụm {house.cluster}
                                </Text>
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default HousePickerSheet;
