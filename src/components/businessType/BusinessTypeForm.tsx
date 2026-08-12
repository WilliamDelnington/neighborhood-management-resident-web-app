import React from "react";
import { Box } from "@components/ui";
import { Input, TextArea, Checkbox } from "@components/customized";
import { BusinessTypeInput } from "@service/businessTypeApi";

export interface BusinessTypeFormValues {
    name: string;
    description: string;
    active: boolean;
    sortOrder: string;
}

export const EMPTY_BUSINESS_TYPE_FORM: BusinessTypeFormValues = {
    name: "",
    description: "",
    active: true,
    sortOrder: "",
};

export function toBusinessTypeInput(
    values: BusinessTypeFormValues,
): BusinessTypeInput {
    return {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        active: values.active,
        sortOrder: values.sortOrder ? Number(values.sortOrder) : undefined,
    };
}

export function isBusinessTypeFormValid(
    values: BusinessTypeFormValues,
): boolean {
    return !!values.name.trim();
}

interface BusinessTypeFormProps {
    values: BusinessTypeFormValues;
    onChange: (values: BusinessTypeFormValues) => void;
}

/**
 * Bo truong dung chung cho tao moi/chinh sua loai hinh kinh doanh (danh muc dung chung).
 */
const BusinessTypeForm: React.FC<BusinessTypeFormProps> = ({
    values,
    onChange,
}) => {
    const set = <K extends keyof BusinessTypeFormValues>(
        key: K,
        value: BusinessTypeFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
                label="Tên loại hình"
                value={values.name}
                onChange={e => set("name", e.target.value)}
            />
            <TextArea
                label="Mô tả"
                placeholder="Mô tả thêm (nếu có)"
                value={values.description}
                onChange={e => set("description", e.target.value)}
            />
            <Input
                label="Thứ tự hiển thị"
                type="number"
                value={values.sortOrder}
                onChange={e => set("sortOrder", e.target.value)}
            />
            <Checkbox
                label="Đang hoạt động"
                value="active"
                checked={values.active}
                onChange={() => set("active", !values.active)}
            />
        </Box>
    );
};

export default BusinessTypeForm;
