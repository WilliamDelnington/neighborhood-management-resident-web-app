import React, { useState } from "react";
import { Box, Text } from "@components/ui";
import { Checkbox, Input, TextArea, Radio } from "@components/customized";
import NeighborhoodPickerSheet from "@components/household/NeighborhoodPickerSheet";
import OrganizationPickerSheet from "@components/house/OrganizationPickerSheet";
import StreetPickerSheet from "@components/house/StreetPickerSheet";
import HouseLocationPicker, {
    EMPTY_HOUSE_GEO,
    HouseGeoValues,
    isHouseGeoValid,
} from "@components/house/HouseLocationPicker";
import { hasPermission } from "@components/role";
import { useStore } from "@store";
import {
    HOUSE_PHYSICAL_STATUS_LABEL,
    HOUSE_USAGE_TYPE_LABEL,
} from "@constants/domain";
import { HouseInput } from "@service/houseApi";
import {
    HOUSE_USAGE_TYPE,
    HousePhysicalStatus,
    HouseUsageType,
    Neighborhood,
    Organization,
    Street,
} from "@dts";

const HOUSE_PHYSICAL_STATUS_ENTRIES = Object.entries(
    HOUSE_PHYSICAL_STATUS_LABEL,
) as [HousePhysicalStatus, string][];

export interface HouseFormValues extends HouseGeoValues {
    cluster: string;
    // "" = chua chon duong/pho chinh thuc, dung cluster tu do (fallback khi
    // khong co quyen "streets.read" - xem canPickStreet ben duoi).
    streetId: string;
    streetLabel: string;
    // "" = chua gan to dan pho. To dan pho la thuoc tinh rieng cua nha so,
    // KHONG suy ra tu streetId (mot duong/pho co the chay qua nhieu to dan
    // pho) - xem models/HouseRecord.ts o backend.
    neighborhoodId: string;
    neighborhoodLabel: string;
    address: string;
    // "" = chua khai bao tinh trang cong trinh - doc lap voi trang thai ho so
    // (HouseStatus).
    physicalStatus: HousePhysicalStatus | "";
    // Muc dich su dung nha do chu nha tu khai bao - co the chon nhieu (vua o
    // vua kinh doanh) - xem models/HouseRecord.ts o backend. Dung de doi
    // chieu voi Ho dan/Ho kinh doanh/Cong ty thuc te da khai bao va nhac nho
    // khi thieu (xem HouseDetailPage.tsx).
    usageTypes: HouseUsageType[];
    otherUsageNote: string;
    note: string;
    // "" = dang ky bang ca nhan (mac dinh). Chi co y nghia luc tao moi - backend
    // khong ho tro doi chu nha sau khi da tao (xem houseRecordService.createHouseRecord).
    organizationId: string;
    organizationLabel: string;
}

export const EMPTY_HOUSE_FORM: HouseFormValues = {
    ...EMPTY_HOUSE_GEO,
    cluster: "",
    streetId: "",
    streetLabel: "",
    neighborhoodId: "",
    neighborhoodLabel: "",
    address: "",
    physicalStatus: "",
    usageTypes: ["household"],
    otherUsageNote: "",
    note: "",
    organizationId: "",
    organizationLabel: "",
};

export function toHouseInput(values: HouseFormValues): HouseInput {
    return {
        cluster: values.streetId ? undefined : values.cluster.trim(),
        streetId: values.streetId || undefined,
        neighborhoodId: values.neighborhoodId || null,
        address: values.address.trim(),
        physicalStatus: values.physicalStatus || undefined,
        usageTypes: values.usageTypes,
        otherUsageNote: values.otherUsageNote.trim() || undefined,
        note: values.note.trim() || undefined,
        organizationId: values.organizationId || undefined,
        gisLatitude:
            values.geoMode === "skip" ? undefined : values.gisLatitude ?? undefined,
        gisLongitude:
            values.geoMode === "skip"
                ? undefined
                : values.gisLongitude ?? undefined,
        gisAccuracyMeters:
            values.geoMode === "skip"
                ? undefined
                : values.gisAccuracyMeters ?? undefined,
        gisSource: values.geoMode === "skip" ? undefined : values.gisSource || undefined,
        geoConsentAccepted:
            values.geoMode === "skip" ? undefined : values.geoConsentAccepted,
    };
}

export function isHouseFormValid(values: HouseFormValues): boolean {
    return !!(
        (values.cluster.trim() || values.streetId) &&
        values.address.trim() &&
        values.usageTypes.length > 0 &&
        isHouseGeoValid(values)
    );
}

interface HouseFormProps {
    values: HouseFormValues;
    onChange: (values: HouseFormValues) => void;
    mode?: "create" | "edit";
}

/**
 * Bo truong dung chung cho tao moi/chinh sua nha so (Sheet tao moi va man chi tiet).
 */
const HouseForm: React.FC<HouseFormProps> = ({
    values,
    onChange,
    mode = "create",
}) => {
    const [streetPickerVisible, setStreetPickerVisible] = useState(false);
    const [neighborhoodPickerVisible, setNeighborhoodPickerVisible] =
        useState(false);
    const [organizationPickerVisible, setOrganizationPickerVisible] =
        useState(false);
    const user = useStore(state => state.user);
    // Chi nguoi dung co quyen "streets.read" moi thay picker chon tu danh sach
    // duong/pho chinh thuc - neu khong co quyen, fallback ve cum dan cu tu do
    // bang text nhu truoc (giong admin-web-app/HouseForm.tsx).
    const canPickStreet = hasPermission(user, "streets.read");
    // To dan pho la lua chon doc lap voi duong/pho (xem ghi chu o
    // HouseFormValues.neighborhoodId) nen khong co fallback text - neu khong
    // co quyen thi don gian la khong hien thi lua chon nay.
    const canPickNeighborhood = hasPermission(user, "neighborhoods.read");
    // Chi house_owner (nguoi co the la nguoi dai dien to chuc) moi thay lua
    // chon nay, va chi luc tao moi - xem ghi chu o HouseFormValues.organizationId.
    const canPickOrganization =
        mode === "create" && hasPermission(user, "organizations.create");
    const set = <K extends keyof HouseFormValues>(
        key: K,
        value: HouseFormValues[K],
    ) => onChange({ ...values, [key]: value });

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {canPickStreet ? (
                <Box>
                    <Text size="xSmall" className="text-text_2 mb-1">
                        Đường/phố
                    </Text>
                    <Box
                        className="bg-ng_10 rounded-lg px-3 py-2"
                        onClick={() => setStreetPickerVisible(true)}
                    >
                        <Text
                            size="small"
                            className={values.streetId ? "" : "text-text_3"}
                        >
                            {values.streetId
                                ? values.streetLabel || values.streetId
                                : "Chọn đường/phố..."}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <Input
                    label="Cụm dân cư"
                    placeholder="VD: Cụm 3"
                    value={values.cluster}
                    onChange={e => set("cluster", e.target.value)}
                />
            )}
            {canPickNeighborhood && (
                <Box>
                    <Text size="xSmall" className="text-text_2 mb-1">
                        Tổ dân phố
                    </Text>
                    <Box flex alignItems="center" style={{ gap: 8 }}>
                        <Box
                            className="bg-ng_10 rounded-lg px-3 py-2"
                            style={{ flex: 1 }}
                            onClick={() => setNeighborhoodPickerVisible(true)}
                        >
                            <Text
                                size="small"
                                className={
                                    values.neighborhoodId ? "" : "text-text_3"
                                }
                            >
                                {values.neighborhoodId
                                    ? values.neighborhoodLabel ||
                                      values.neighborhoodId
                                    : "Chưa gán tổ dân phố"}
                            </Text>
                        </Box>
                        {values.neighborhoodId && (
                            <Text
                                size="xSmall"
                                className="text-main"
                                onClick={() =>
                                    onChange({
                                        ...values,
                                        neighborhoodId: "",
                                        neighborhoodLabel: "",
                                    })
                                }
                            >
                                Bỏ chọn
                            </Text>
                        )}
                    </Box>
                </Box>
            )}
            <Input
                label="Địa chỉ"
                placeholder="Số nhà, ngõ, đường..."
                value={values.address}
                onChange={e => set("address", e.target.value)}
            />
            <HouseLocationPicker
                values={values}
                onChange={geo => onChange({ ...values, ...geo })}
            />
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Mục đích sử dụng
                </Text>
                <Box flex style={{ gap: 12, flexWrap: "wrap" }}>
                    {HOUSE_USAGE_TYPE.map(usageType => (
                        <Checkbox
                            key={usageType}
                            label={HOUSE_USAGE_TYPE_LABEL[usageType]}
                            value={usageType}
                            checked={values.usageTypes.includes(usageType)}
                            onChange={() =>
                                set(
                                    "usageTypes",
                                    values.usageTypes.includes(usageType)
                                        ? values.usageTypes.filter(
                                              t => t !== usageType,
                                          )
                                        : [...values.usageTypes, usageType],
                                )
                            }
                        />
                    ))}
                </Box>
                <Input
                    className="mt-2"
                    placeholder="Mục đích sử dụng khác (nếu có)"
                    value={values.otherUsageNote}
                    onChange={e => set("otherUsageNote", e.target.value)}
                />
            </Box>
            <Box>
                <Text size="xSmall" className="text-text_2 mb-1">
                    Tình trạng công trình
                </Text>
                <Box flex style={{ gap: 12, flexWrap: "wrap" }}>
                    {HOUSE_PHYSICAL_STATUS_ENTRIES.map(([key, label]) => (
                        <Radio
                            key={key}
                            label={label}
                            checked={values.physicalStatus === key}
                            onChange={() => set("physicalStatus", key)}
                        />
                    ))}
                </Box>
            </Box>
            <TextArea
                label="Ghi chú"
                placeholder="Ghi chú thêm (nếu có)"
                value={values.note}
                onChange={e => set("note", e.target.value)}
            />
            {canPickOrganization && (
                <Box>
                    <Text size="xSmall" className="text-text_2 mb-1">
                        Đăng ký dưới tên tổ chức (nếu có)
                    </Text>
                    <Box flex alignItems="center" style={{ gap: 8 }}>
                        <Box
                            className="bg-ng_10 rounded-lg px-3 py-2"
                            style={{ flex: 1 }}
                            onClick={() => setOrganizationPickerVisible(true)}
                        >
                            <Text
                                size="small"
                                className={
                                    values.organizationId ? "" : "text-text_3"
                                }
                            >
                                {values.organizationId
                                    ? values.organizationLabel ||
                                      values.organizationId
                                    : "Đăng ký bằng cá nhân (mặc định)"}
                            </Text>
                        </Box>
                        {values.organizationId && (
                            <Text
                                size="xSmall"
                                className="text-main"
                                onClick={() =>
                                    onChange({
                                        ...values,
                                        organizationId: "",
                                        organizationLabel: "",
                                    })
                                }
                            >
                                Bỏ chọn
                            </Text>
                        )}
                    </Box>
                </Box>
            )}
            {canPickStreet && (
                <StreetPickerSheet
                    visible={streetPickerVisible}
                    onClose={() => setStreetPickerVisible(false)}
                    onSelect={(street: Street) =>
                        onChange({
                            ...values,
                            streetId: street._id,
                            streetLabel: street.name,
                        })
                    }
                />
            )}
            {canPickNeighborhood && (
                <NeighborhoodPickerSheet
                    visible={neighborhoodPickerVisible}
                    onClose={() => setNeighborhoodPickerVisible(false)}
                    onSelect={(neighborhood: Neighborhood) =>
                        onChange({
                            ...values,
                            neighborhoodId: neighborhood._id,
                            neighborhoodLabel: neighborhood.name,
                        })
                    }
                />
            )}
            {canPickOrganization && (
                <OrganizationPickerSheet
                    visible={organizationPickerVisible}
                    onClose={() => setOrganizationPickerVisible(false)}
                    onSelect={(organization: Organization) =>
                        onChange({
                            ...values,
                            organizationId: organization._id,
                            organizationLabel: organization.name,
                        })
                    }
                />
            )}
        </Box>
    );
};

export default HouseForm;
