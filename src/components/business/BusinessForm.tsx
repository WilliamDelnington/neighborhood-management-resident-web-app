import React, { useState } from "react";
import { Box, Text } from "@components/ui";
import { Input, TextArea, Checkbox } from "@components/customized";
import { BusinessType } from "@dts";
import { BusinessInput } from "@service/businessApi";
import BusinessTypePickerSheet from "./BusinessTypePickerSheet";

export interface BusinessFormValues {
    name: string;
    ownerName: string;
    taxCode: string;
    phone: string;
    active: boolean;
    businessTypeId: string;
    businessTypeLabel: string;
    note: string;
}

export const EMPTY_BUSINESS_FORM: BusinessFormValues = {
    name: "",
    ownerName: "",
    taxCode: "",
    phone: "",
    active: true,
    businessTypeId: "",
    businessTypeLabel: "",
    note: "",
};

export function toBusinessInput(
    values: BusinessFormValues,
    houseId: string,
): BusinessInput {
    return {
        name: values.name.trim(),
        houseId,
        businessType: values.businessTypeId || null,
        ownerName: values.ownerName.trim() || undefined,
        taxCode: values.taxCode.trim() || undefined,
        phone: values.phone.trim() || undefined,
        active: values.active,
        note: values.note.trim() || undefined,
    };
}

export function isBusinessFormValid(values: BusinessFormValues): boolean {
    return !!values.name.trim();
}

interface BusinessFormProps {
    values: BusinessFormValues;
    onChange: (values: BusinessFormValues) => void;
}

/**
 * Bo truong dung chung cho tao moi/chinh sua ho kinh doanh. houseId khong nam
 * trong form vi luon co san tu ngu canh (man chi tiet nha so).
 */
const BusinessForm: React.FC<BusinessFormProps> = ({ values, onChange }) => {
    const [pickerVisible, setPickerVisible] = useState(false);
    const set = <K extends keyof BusinessFormValues>(
        key: K,
        value: BusinessFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
                label="Tên hộ kinh doanh"
                value={values.name}
                onChange={e => set("name", e.target.value)}
            />
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Loại hình kinh doanh
                </Text>
                <Box
                    className="bg-ng_10 rounded-lg px-3 py-2"
                    onClick={() => setPickerVisible(true)}
                >
                    <Text
                        size="small"
                        className={values.businessTypeId ? "" : "text-text_3"}
                    >
                        {values.businessTypeId
                            ? values.businessTypeLabel || "Loại hình đã chọn"
                            : "Chọn loại hình..."}
                    </Text>
                </Box>
            </Box>
            <Input
                label="Chủ hộ kinh doanh"
                value={values.ownerName}
                onChange={e => set("ownerName", e.target.value)}
            />
            <Input
                label="Mã số thuế"
                value={values.taxCode}
                onChange={e => set("taxCode", e.target.value)}
            />
            <Input
                label="Số điện thoại"
                value={values.phone}
                onChange={e => set("phone", e.target.value)}
            />
            <Checkbox
                label="Đang hoạt động"
                value="active"
                checked={values.active}
                onChange={() => set("active", !values.active)}
            />
            <TextArea
                label="Ghi chú"
                placeholder="Ghi chú thêm (nếu có)"
                value={values.note}
                onChange={e => set("note", e.target.value)}
            />
            <BusinessTypePickerSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={(businessType: BusinessType) =>
                    onChange({
                        ...values,
                        businessTypeId: businessType._id,
                        businessTypeLabel: businessType.name,
                    })
                }
            />
        </Box>
    );
};

export default BusinessForm;
