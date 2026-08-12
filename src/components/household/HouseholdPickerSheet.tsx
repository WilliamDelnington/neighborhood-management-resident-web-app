import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { searchHouseholds } from "@service/householdApi";
import { Household } from "@dts";

export interface HouseholdPickerSheetProps {
    visible: boolean;
    cluster?: string;
    onClose: () => void;
    onSelect: (household: Household) => void;
}

const HouseholdPickerSheet: React.FC<HouseholdPickerSheetProps> = ({
    visible,
    cluster,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Household[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            searchHouseholds({ search: search || undefined, cluster })
                .then(res => setItems(res.items))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        }, 300);
        // eslint-disable-next-line consistent-return
        return () => clearTimeout(timer);
    }, [visible, search, cluster]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Chọn hộ khẩu"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo mã hộ, địa chỉ, chủ hộ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && items.length === 0 && (
                        <EmptyState label="Không tìm thấy hộ khẩu phù hợp" />
                    )}
                    {!loading &&
                        items.map(household => (
                            <Box
                                key={household._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(household);
                                    onClose();
                                }}
                            >
                                <Text size="small" bold>
                                    {household.code} — {household.address}
                                </Text>
                                <Text size="xSmall" className="text-text_2">
                                    Chủ hộ: {household.headOfHousehold} · Cụm{" "}
                                    {household.cluster}
                                </Text>
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default HouseholdPickerSheet;
