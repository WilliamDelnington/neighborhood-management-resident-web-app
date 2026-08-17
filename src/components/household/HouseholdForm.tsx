import React, { useState } from "react";
import { Box, Text } from "@components/ui";
import { Input, TextArea, Radio, Checkbox } from "@components/customized";
import { HousePickerSheet } from "@components/house";
import { PendingAttachmentsPicker } from "@components/attachments";
import { LOAI_SO_HUU_LABEL } from "@constants/domain";
import { House, LoaiSoHuu } from "@dts";
import { HouseholdInput } from "@service/householdApi";

export interface HouseholdFormValues {
    cluster: string;
    address: string;
    headOfHousehold: string;
    phone: string;
    // Chi dung o mode="create" (xem HouseholdFormProps.mode) - danh dau nguoi
    // lien he (phone o tren) co phai chinh chu ho khong.
    contactIsHead: boolean;
    contactName: string;
    memberCount: string;
    ownershipType: LoaiSoHuu;
    needsSupport: boolean;
    houseId: string;
    houseLabel: string;
    note: string;
    attachments: File[];
}

export const EMPTY_HOUSEHOLD_FORM: HouseholdFormValues = {
    cluster: "",
    address: "",
    headOfHousehold: "",
    phone: "",
    contactIsHead: true,
    contactName: "",
    memberCount: "",
    ownershipType: "chinh_chu",
    needsSupport: false,
    houseId: "",
    houseLabel: "",
    note: "",
    attachments: [],
};

export function toHouseholdInput(
    values: HouseholdFormValues,
    mode: "create" | "edit" = "edit",
): HouseholdInput {
    const base: HouseholdInput = {
        cluster: values.cluster.trim(),
        address: values.address.trim(),
        headOfHousehold: values.headOfHousehold.trim(),
        phone: values.phone.trim() || undefined,
        memberCount: values.memberCount
            ? Number(values.memberCount)
            : undefined,
        ownershipType: values.ownershipType,
        needsSupport: values.needsSupport,
        houseId: values.houseId || null,
        note: values.note.trim() || undefined,
    };
    // contactIsHead/contactName chi co y nghia luc khai bao ho dan moi (quyet
    // dinh tao them Citizen "Người liên hệ" o backend) - khong gui khi chinh
    // sua ho dan da co san, vi luc do nhan khau da duoc quan ly rieng o man
    // chi tiet (xem HouseholdDetailPage).
    if (mode === "create") {
        return {
            ...base,
            contactIsHead: values.contactIsHead,
            contactName: values.contactIsHead
                ? undefined
                : values.contactName.trim() || undefined,
        };
    }
    return base;
}

export function isHouseholdFormValid(
    values: HouseholdFormValues,
    mode: "create" | "edit" = "edit",
): boolean {
    const baseValid = !!(
        values.houseId.trim() &&
        values.cluster.trim() &&
        values.address.trim() &&
        values.headOfHousehold.trim()
    );
    if (mode !== "create") return baseValid;
    return (
        baseValid &&
        !!values.phone.trim() &&
        (values.contactIsHead || !!values.contactName.trim())
    );
}

interface HouseholdFormProps {
    values: HouseholdFormValues;
    onChange: (values: HouseholdFormValues) => void;
    /**
     * An khi chinh sua ho dan da co tu man chi tiet - man do da co
     * AttachmentUploader rieng de quan ly tai lieu (xem HouseholdDetailPage),
     * nen khong can chon lai file trong Form (chi dung khi tao moi).
     */
    showAttachments?: boolean;
    /**
     * "create": hien phan "Người liên hệ" (checkbox + ten neu khac chu ho) -
     * quyet dinh backend tao them mot Citizen rieng cho nguoi lien he hay chi
     * gan phone cho Citizen "Chủ hộ" (xem toHouseholdInput).
     * "edit" (mac dinh): chi hien truong "Số điện thoại" don gian nhu truoc -
     * nhan khau da co san duoc quan ly rieng o man chi tiet ho dan.
     */
    mode?: "create" | "edit";
}

/**
 * Bo truong dung chung cho tao moi/chinh sua ho dan (dung o Sheet tao moi va man chi tiet).
 */
const HouseholdForm: React.FC<HouseholdFormProps> = ({
    values,
    onChange,
    showAttachments = true,
    mode = "edit",
}) => {
    const [housePickerVisible, setHousePickerVisible] = useState(false);
    const set = <K extends keyof HouseholdFormValues>(
        key: K,
        value: HouseholdFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Nhà số
                </Text>
                <Box
                    className="bg-ng_10 rounded-lg px-3 py-2"
                    onClick={() => setHousePickerVisible(true)}
                >
                    <Text
                        size="small"
                        className={values.houseId ? "" : "text-text_3"}
                    >
                        {values.houseId ? values.houseLabel : "Chọn nhà số..."}
                    </Text>
                </Box>
            </Box>
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Cụm dân cư
                </Text>
                <Box className="bg-ng_10 rounded-lg px-3 py-2 opacity-60">
                    <Text
                        size="small"
                        className={values.cluster ? "" : "text-text_3"}
                    >
                        {values.cluster || "Sẽ tự động điền theo nhà số"}
                    </Text>
                </Box>
                <Text size="xxSmall" className="text-text_3 mt-1">
                    Cụm dân cư được lấy theo nhà số liên kết
                </Text>
            </Box>
            <Input
                label="Địa chỉ"
                placeholder="Số nhà, ngõ, đường..."
                value={values.address}
                onChange={e => set("address", e.target.value)}
            />
            <Input
                label="Chủ hộ"
                placeholder="Họ tên chủ hộ"
                value={values.headOfHousehold}
                onChange={e => set("headOfHousehold", e.target.value)}
            />
            {mode === "create" ? (
                <Box
                    className="bg-ng_10 rounded-lg p-3"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <Text size="xSmall" className="text-text_2">
                        Người liên hệ
                    </Text>
                    <Checkbox
                        label="Người liên hệ là chủ hộ"
                        value="contactIsHead"
                        checked={values.contactIsHead}
                        onChange={() =>
                            set("contactIsHead", !values.contactIsHead)
                        }
                    />
                    {!values.contactIsHead && (
                        <Input
                            label="Tên người liên hệ"
                            placeholder="Họ tên người liên hệ"
                            value={values.contactName}
                            onChange={e => set("contactName", e.target.value)}
                        />
                    )}
                    <Input
                        label="Số điện thoại liên hệ"
                        value={values.phone}
                        onChange={e => set("phone", e.target.value)}
                    />
                </Box>
            ) : (
                <Input
                    label="Số điện thoại"
                    value={values.phone}
                    onChange={e => set("phone", e.target.value)}
                />
            )}
            <Input
                label="Số nhân khẩu"
                type="number"
                value={values.memberCount}
                onChange={e => set("memberCount", e.target.value)}
            />
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Hình thức lưu trú
                </Text>
                <Box flex style={{ gap: 20 }}>
                    {(
                        Object.entries(LOAI_SO_HUU_LABEL) as [
                            LoaiSoHuu,
                            string,
                        ][]
                    ).map(([key, label]) => (
                        <Radio
                            key={key}
                            label={label}
                            checked={values.ownershipType === key}
                            onChange={() => set("ownershipType", key)}
                        />
                    ))}
                </Box>
            </Box>
            <Checkbox
                label="Hộ cần hỗ trợ"
                value="needsSupport"
                checked={values.needsSupport}
                onChange={() => set("needsSupport", !values.needsSupport)}
            />
            <TextArea
                label="Ghi chú"
                placeholder="Ghi chú thêm (nếu có)"
                value={values.note}
                onChange={e => set("note", e.target.value)}
            />
            {showAttachments && (
                <PendingAttachmentsPicker
                    files={values.attachments}
                    onChange={files => set("attachments", files)}
                />
            )}
            <HousePickerSheet
                visible={housePickerVisible}
                status={["unverified", "pending", "verified"]}
                onClose={() => setHousePickerVisible(false)}
                onSelect={(house: House) =>
                    onChange({
                        ...values,
                        houseId: house._id,
                        houseLabel: `${house.code} — ${house.address}`,
                        cluster: house.cluster || values.cluster,
                    })
                }
            />
        </Box>
    );
};

export default HouseholdForm;
