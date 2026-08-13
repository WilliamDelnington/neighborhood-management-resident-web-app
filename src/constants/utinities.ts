import * as Icon from "@components/icons";
import { Utinity } from "@dts";

export const APP_UTINITIES: Array<Utinity> = [
    {
        key: "complaints",
        label: "Phản ánh của tôi",
        icon: Icon.PenIcon,
        color: "#3B82F6",
        bgColor: "#EBF4FF",
        path: "/complaints/lookup",
    },
    {
        key: "meetings",
        label: "Lịch họp",
        icon: Icon.CalendarIcon,
        color: "#16A34A",
        bgColor: "#DCFCE7",
        path: "/meetings",
    },
    {
        key: "surveys",
        label: "Khảo sát",
        icon: Icon.QAndAIcon,
        color: "#4F46E5",
        bgColor: "#E0E7FF",
        path: "/surveys",
    },
    {
        key: "files",
        label: "Biểu mẫu",
        icon: Icon.BookIcon,
        color: "#64748B",
        bgColor: "#F1F5F9",
        path: "/files",
    },
];

/**
 * Danh sach tien ich mo rong hien trong the "Tien ich khac" tren Home - khac
 * voi APP_UTINITIES (6 thao tac nhanh luon hien day du), danh sach nay co the
 * dai hon 6 va Home chi hien 6 muc dau tien, an cac muc con lai sau nut
 * "Xem them" (xem HomePage.tsx). Thu tu trong mang la thu tu uu tien hien thi
 * (bien tap thu cong, khong dua tren so lieu su dung thuc te).
 */
export const MORE_FEATURES: Array<Utinity> = [
    {
        key: "my-house",
        label: "Nhà của tôi",
        icon: Icon.HouseIcon,
        color: "#0891B2",
        bgColor: "#CFFAFE",
        path: "/house/mine",
    },
    {
        key: "inspection-self-declarations",
        label: "Biểu mẫu tự khai",
        icon: Icon.QAndAIcon,
        color: "#0F766E",
        bgColor: "#CCFBF1",
        path: "/inspections/self-declarations",
    },
    {
        key: "admin-households",
        label: "Hộ dân",
        icon: Icon.EnterpriseIcon,
        color: "#C2410C",
        bgColor: "#FFEDD5",
        path: "/admin/households",
        requiredPermission: "households.read",
    },
    {
        key: "admin-citizens",
        label: "Nhân khẩu",
        icon: Icon.PersonalIcon,
        color: "#0D9488",
        bgColor: "#CCFBF1",
        path: "/admin/citizens",
        requiredPermission: "citizens.read",
    },
    {
        key: "inspections",
        label: "Rà soát chiến dịch",
        icon: Icon.QAndAIcon,
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        path: "/inspections",
        requiredPermission: "inspections.read",
    },
    {
        key: "support",
        label: "Hỗ trợ",
        icon: Icon.HeadsetIcon,
        color: "#4338CA",
        bgColor: "#E0E7FF",
        path: "/support",
    },
    {
        key: "incident-shortcut",
        label: "Báo sự cố hạ tầng",
        icon: Icon.PenIcon,
        color: "#EA580C",
        bgColor: "#FFEDD5",
        path: "/complaints/incident-shortcut",
    },
    {
        key: "admin-business-types",
        label: "Loại hình kinh doanh",
        icon: Icon.GlobeIcon,
        color: "#6D28D9",
        bgColor: "#EDE9FE",
        path: "/admin/business-types",
        requiredPermission: "business_types.read",
    },
    {
        key: "election",
        label: "Bầu cử",
        icon: Icon.VoteIcon,
        color: "#B91C1C",
        bgColor: "#FEE2E2",
        inDevelopment: true,
    },
];

export type MiniAppFeatureConfigEntry = {
    key: string;
    order: number;
    visible: boolean;
};

/**
 * Ap dung cau hinh thu tu/hien thi tinh nang do admin luu (Setting key
 * "mini_app_features", xem settingsApi.ts) len tren catalog tinh nang tinh
 * (APP_UTINITIES + MORE_FEATURES). Khong co cau hinh (chua duoc admin luu lan
 * nao) -> giu nguyen thu tu catalog nhu truoc gio (hanh vi mac dinh). Tinh
 * nang co trong catalog nhung chua co trong config (vd vua them vao code) van
 * duoc hien, xep sau cac tinh nang da duoc cau hinh, theo dung thu tu catalog.
 */
export function resolveFeatureOrder(
    catalog: Utinity[],
    config?: MiniAppFeatureConfigEntry[] | null,
): Utinity[] {
    if (!config || config.length === 0) return catalog;

    const configByKey = new Map(config.map(c => [c.key, c]));
    return catalog
        .filter(item => configByKey.get(item.key)?.visible !== false)
        .map((item, index) => ({
            item,
            order: configByKey.get(item.key)?.order ?? Infinity,
            index,
        }))
        .sort((a, b) => a.order - b.order || a.index - b.index)
        .map(({ item }) => item);
}

export const EMERGENCY_HOTLINES: Array<{
    key: string;
    label: string;
    phoneNumber: string;
}> = [
    { key: "police", label: "Công an", phoneNumber: "113" },
    { key: "fire", label: "Cứu hỏa", phoneNumber: "114" },
    { key: "ambulance", label: "Cấp cứu", phoneNumber: "115" },
];

export const CONTACTS: Array<Utinity> = [
    {
        key: "police-113",
        label: "Công an (113)",
        icon: Icon.HeadphoneIcon,
        phoneNumber: "113",
    },
    {
        key: "fire-114",
        label: "Phòng cháy chữa cháy (114)",
        icon: Icon.HeadphoneIcon,
        phoneNumber: "114",
    },
    {
        key: "ambulance-115",
        label: "Cấp cứu y tế (115)",
        icon: Icon.HeadphoneIcon,
        phoneNumber: "115",
    },
    {
        key: "regional-police",
        label: "Công an khu vực phường Dương Nội",
        icon: Icon.PersonalIcon,
        phoneNumber: "",
    },
    {
        key: "neighborhood-leader",
        label: "Tổ trưởng tổ dân phố",
        icon: Icon.EnterpriseIcon,
        phoneNumber: "",
    },
];
