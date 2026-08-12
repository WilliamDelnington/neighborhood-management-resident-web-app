import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { LoadingState, EmptyState } from "@components/admin";
import { fetchEligibleSenderCorrespondenceTypes } from "@service/correspondenceTypeApi";
import { CorrespondenceType } from "@dts";

export interface CorrespondenceTypePickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: CorrespondenceType) => void;
}

const CorrespondenceTypePickerSheet: React.FC<
    CorrespondenceTypePickerSheetProps
> = ({ visible, onClose, onSelect }) => {
    const [items, setItems] = useState<CorrespondenceType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        fetchEligibleSenderCorrespondenceTypes()
            .then(res => setItems(res.items))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [visible]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            title="Chọn loại văn bản"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {loading && <LoadingState />}
                {!loading && items.length === 0 && (
                    <EmptyState label="Bạn chưa được phép gửi loại văn bản nào" />
                )}
                {!loading &&
                    items.map(type => (
                        <Box
                            key={type._id}
                            p={3}
                            mb={2}
                            className="bg-ng_10 rounded-xl"
                            onClick={() => {
                                onSelect(type);
                                onClose();
                            }}
                        >
                            <Text size="small">{type.name}</Text>
                            {type.description && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-1"
                                >
                                    {type.description}
                                </Text>
                            )}
                        </Box>
                    ))}
            </Box>
        </Sheet>
    );
};

export default CorrespondenceTypePickerSheet;
