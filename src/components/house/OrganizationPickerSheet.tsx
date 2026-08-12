import React, { useEffect, useState } from "react";
import { Box, Sheet, Text } from "@components/ui";
import { Input } from "@components/customized";
import { LoadingState, EmptyState } from "@components/admin";
import { fetchOrganizations } from "@service/organizationApi";
import { Organization } from "@dts";

export interface OrganizationPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (organization: Organization) => void;
}

/**
 * Sheet chon to chuc (trong so cac to chuc ma minh la nguoi dai dien - server
 * tu loc theo actor, xem organizationService.listOrganizations) de dang ky
 * nha so duoi ten to chuc do, thay vi dung ten ca nhan minh.
 */
const OrganizationPickerSheet: React.FC<OrganizationPickerSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        const timer = setTimeout(() => {
            fetchOrganizations({ search: search || undefined, active: true })
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
            title="Chọn tổ chức"
            autoHeight
            mask
        >
            <Box p={4} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Input
                    placeholder="Tìm theo tên hoặc mã số thuế..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Box mt={3}>
                    {loading && <LoadingState />}
                    {!loading && items.length === 0 && (
                        <EmptyState label="Bạn chưa là người đại diện của tổ chức nào" />
                    )}
                    {!loading &&
                        items.map(organization => (
                            <Box
                                key={organization._id}
                                p={3}
                                mb={2}
                                className="bg-ng_10 rounded-xl"
                                onClick={() => {
                                    onSelect(organization);
                                    onClose();
                                }}
                            >
                                <Text size="small" bold>
                                    {organization.name}
                                </Text>
                                <Text size="xSmall" className="text-text_2">
                                    {organization.taxCode ||
                                        "Chưa có mã số thuế"}
                                </Text>
                            </Box>
                        ))}
                </Box>
            </Box>
        </Sheet>
    );
};

export default OrganizationPickerSheet;
