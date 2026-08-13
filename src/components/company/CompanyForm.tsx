import React from "react";
import { Box } from "@components/ui";
import { Input, TextArea, Checkbox } from "@components/customized";
import { CompanyInput } from "@service/companyApi";

export interface CompanyFormValues {
    name: string;
    ownerName: string;
    taxCode: string;
    phone: string;
    active: boolean;
    note: string;
}

export const EMPTY_COMPANY_FORM: CompanyFormValues = {
    name: "",
    ownerName: "",
    taxCode: "",
    phone: "",
    active: true,
    note: "",
};

export function toCompanyInput(
    values: CompanyFormValues,
    houseId: string,
): CompanyInput {
    return {
        name: values.name.trim(),
        houseId,
        ownerName: values.ownerName.trim() || undefined,
        taxCode: values.taxCode.trim(),
        phone: values.phone.trim() || undefined,
        active: values.active,
        note: values.note.trim() || undefined,
    };
}

export function isCompanyFormValid(values: CompanyFormValues): boolean {
    return !!values.name.trim() && !!values.taxCode.trim();
}

interface CompanyFormProps {
    values: CompanyFormValues;
    onChange: (values: CompanyFormValues) => void;
}

/**
 * Bo truong dung chung cho tao moi/chinh sua cong ty. Mirror BusinessForm.tsx
 * nhung khong co loai hinh kinh doanh (Company khong co quy trinh giay to
 * rieng) - houseId khong nam trong form vi luon co san tu ngu canh (man chi
 * tiet nha so).
 */
const CompanyForm: React.FC<CompanyFormProps> = ({ values, onChange }) => {
    const set = <K extends keyof CompanyFormValues>(
        key: K,
        value: CompanyFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
                label="Tên công ty"
                value={values.name}
                onChange={e => set("name", e.target.value)}
            />
            <Input
                label="Mã số thuế"
                value={values.taxCode}
                onChange={e => set("taxCode", e.target.value)}
            />
            <Input
                label="Người đại diện"
                value={values.ownerName}
                onChange={e => set("ownerName", e.target.value)}
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
        </Box>
    );
};

export default CompanyForm;
