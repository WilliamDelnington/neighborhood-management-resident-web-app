import React, { useState } from "react";
import { Box, DatePicker, Text } from "@components/ui";
import { Input, Radio, Checkbox } from "@components/customized";
import { HouseholdPickerSheet } from "@components/household";
import { GIOI_TINH_LABEL, LOAI_CU_TRU_LABEL } from "@constants/domain";
import { GioiTinh, Household, LoaiCuTru } from "@dts";
import { CitizenInput } from "@service/citizenApi";

export interface CitizenFormValues {
    fullName: string;
    phone: string;
    cccd: string;
    birthDate: Date | null;
    gender: GioiTinh;
    relationToHead: string;
    householdId: string;
    householdLabel: string;
    residenceType: LoaiCuTru;
    isElderly: boolean;
    isChild: boolean;
    isDisabledOrSupportNeeded: boolean;
    isPartyMember: boolean;
    isUnionMember: boolean;
}

export const EMPTY_CITIZEN_FORM: CitizenFormValues = {
    fullName: "",
    phone: "",
    cccd: "",
    birthDate: null,
    gender: "nam",
    relationToHead: "",
    householdId: "",
    householdLabel: "",
    residenceType: "thuong_tru",
    isElderly: false,
    isChild: false,
    isDisabledOrSupportNeeded: false,
    isPartyMember: false,
    isUnionMember: false,
};

export function toCitizenInput(values: CitizenFormValues): CitizenInput {
    return {
        fullName: values.fullName.trim(),
        householdId: values.householdId,
        phone: values.phone.trim() || undefined,
        cccd: values.cccd.trim() || undefined,
        birthDate: values.birthDate
            ? values.birthDate.toISOString()
            : undefined,
        gender: values.gender,
        relationToHead: values.relationToHead.trim() || undefined,
        residenceType: values.residenceType,
        isElderly: values.isElderly,
        isChild: values.isChild,
        isDisabledOrSupportNeeded: values.isDisabledOrSupportNeeded,
        isPartyMember: values.isPartyMember,
        isUnionMember: values.isUnionMember,
    };
}

export function isCitizenFormValid(values: CitizenFormValues): boolean {
    return !!(values.fullName.trim() && values.householdId);
}

interface CitizenFormProps {
    values: CitizenFormValues;
    onChange: (values: CitizenFormValues) => void;
    /** An khi tao nhan khau tu man chi tiet ho dan (da co household co dinh). */
    lockHousehold?: boolean;
}

/**
 * Bo truong dung chung cho tao moi/chinh sua nhan khau (Sheet tren man danh sach).
 */
const CitizenForm: React.FC<CitizenFormProps> = ({
    values,
    onChange,
    lockHousehold,
}) => {
    const [pickerVisible, setPickerVisible] = useState(false);
    const set = <K extends keyof CitizenFormValues>(
        key: K,
        value: CitizenFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!lockHousehold && (
                <Box>
                    <Text size="xSmall" className="text-text_2 mb-1">
                        Hộ khẩu
                    </Text>
                    <Box
                        className="bg-ng_10 rounded-lg px-3 py-2"
                        onClick={() => setPickerVisible(true)}
                    >
                        <Text
                            size="small"
                            className={values.householdId ? "" : "text-text_3"}
                        >
                            {values.householdId
                                ? values.householdLabel
                                : "Chọn hộ khẩu..."}
                        </Text>
                    </Box>
                </Box>
            )}
            <Input
                label="Họ tên"
                value={values.fullName}
                onChange={e => set("fullName", e.target.value)}
            />
            <Input
                label="Số điện thoại"
                value={values.phone}
                onChange={e => set("phone", e.target.value)}
            />
            <Input
                label="Số CCCD"
                value={values.cccd}
                onChange={e => set("cccd", e.target.value)}
            />
            <DatePicker
                label="Ngày sinh"
                title="Chọn ngày sinh"
                value={values.birthDate || undefined}
                onChange={date => set("birthDate", date)}
                placeholder="Chọn ngày sinh"
            />
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Giới tính
                </Text>
                <Box flex style={{ gap: 16 }}>
                    {(
                        Object.entries(GIOI_TINH_LABEL) as [GioiTinh, string][]
                    ).map(([key, label]) => (
                        <Radio
                            key={key}
                            label={label}
                            checked={values.gender === key}
                            onChange={() => set("gender", key)}
                        />
                    ))}
                </Box>
            </Box>
            <Input
                label="Quan hệ với chủ hộ"
                placeholder="VD: Con, vợ, chồng..."
                value={values.relationToHead}
                onChange={e => set("relationToHead", e.target.value)}
            />
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Loại cư trú
                </Text>
                <Box flex style={{ gap: 16 }}>
                    {(
                        Object.entries(LOAI_CU_TRU_LABEL) as [
                            LoaiCuTru,
                            string,
                        ][]
                    ).map(([key, label]) => (
                        <Radio
                            key={key}
                            label={label}
                            checked={values.residenceType === key}
                            onChange={() => set("residenceType", key)}
                        />
                    ))}
                </Box>
            </Box>
            <Box style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Checkbox
                    label="Người cao tuổi"
                    value="isElderly"
                    checked={values.isElderly}
                    onChange={() => set("isElderly", !values.isElderly)}
                />
                <Checkbox
                    label="Trẻ em"
                    value="isChild"
                    checked={values.isChild}
                    onChange={() => set("isChild", !values.isChild)}
                />
                <Checkbox
                    label="Khuyết tật / cần hỗ trợ"
                    value="isDisabledOrSupportNeeded"
                    checked={values.isDisabledOrSupportNeeded}
                    onChange={() =>
                        set(
                            "isDisabledOrSupportNeeded",
                            !values.isDisabledOrSupportNeeded,
                        )
                    }
                />
                <Checkbox
                    label="Đảng viên"
                    value="isPartyMember"
                    checked={values.isPartyMember}
                    onChange={() => set("isPartyMember", !values.isPartyMember)}
                />
                <Checkbox
                    label="Đoàn viên / hội viên"
                    value="isUnionMember"
                    checked={values.isUnionMember}
                    onChange={() => set("isUnionMember", !values.isUnionMember)}
                />
            </Box>
            {!lockHousehold && (
                <HouseholdPickerSheet
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={(household: Household) =>
                        onChange({
                            ...values,
                            householdId: household._id,
                            householdLabel: `${household.code} — ${household.address}`,
                        })
                    }
                />
            )}
        </Box>
    );
};

export default CitizenForm;
