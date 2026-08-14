import type {
    AppointmentStatus,
    BusinessDocumentStatus,
    DangKyHop,
    GioiTinh,
    HouseOwnershipRelationshipType,
    HouseOwnershipVerificationStatus,
    HousePhysicalStatus,
    HouseStatus,
    HouseUsageType,
    LoaiCauHoiKhaoSat,
    LoaiCuTru,
    LoaiSoHuu,
    LoaiThongBao,
    LoaiYeuCauHoTro,
    MucDoAnNinh,
    MucNguyCoPccc,
    NhomPhanAnh,
    RequestPriority,
    RequestStatus,
    RequestType,
    Role,
    TrangThaiPhanAnh,
    TrangThaiYeuCauHoTro,
    VerificationStatus,
} from "@dts";

export const ROLE_LABEL: Record<Role, string> = {
    house_owner: "Chủ sở hữu",
    neighborhood_leader: "Tổ trưởng",
    neighborhood_coleader: "Tổ phó",
    secretary: "Bí thư",
    regional_police: "Công an khu vực",
    people_committee_official: "Cán bộ UBND",
    admin: "Quản trị viên",
};

/**
 * Ten hien thi cua ung dung tren man hinh chinh - doi theo vai tro dang nhap:
 * house_owner (quan ly nha/ho dan/nhan khau cua rieng minh) thay vi nhan vien/
 * admin (quan ly toan bo to dan pho). Dung khi chua dang nhap hoac vai tro
 * khac house_owner.
 */
export const APP_NAME_DEFAULT = "Quản lý nhà số";
export const APP_NAME_HOUSE_OWNER = "Quản lý nhà số";

export const NHOM_PHAN_ANH_LABEL: Record<NhomPhanAnh, string> = {
    an_ninh_trat_tu: "An ninh trật tự",
    pccc: "PCCC",
    ve_sinh_moi_truong: "Vệ sinh môi trường",
    ha_tang_dien_nuoc: "Hạ tầng điện nước",
    chieu_sang: "Chiếu sáng",
    tranh_chap_dan_cu: "Tranh chấp dân cư",
    tam_tru_nha_cho_thue: "Tạm trú / nhà cho thuê",
    gop_y_chung: "Góp ý chung",
    ha_tang: "Hạ tầng (đường, cống, cây, rác...)",
    khac: "Khác",
};

export const TRANG_THAI_PHAN_ANH_LABEL: Record<TrangThaiPhanAnh, string> = {
    moi_tiep_nhan: "Mới tiếp nhận",
    da_tiep_nhan: "Đã tiếp nhận",
    dang_xu_ly: "Đang xử lý",
    da_chuyen_ubnd: "Đã chuyển UBND phường",
    da_xu_ly: "Đã xử lý",
    hoan_thanh: "Hoàn thành",
    dong: "Đóng",
    can_bo_sung: "Cần bổ sung thông tin",
};

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
    pccc: "PCCC",
    security: "An ninh",
    other: "Khác",
    task: "Nhiệm vụ",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
    pending: "Chưa xử lý",
    acknowledged: "Đã tiếp nhận",
    in_progress: "Đang xử lý",
    needs_info: "Yêu cầu bổ sung",
    awaiting_confirmation: "Chờ xác nhận",
    resolved: "Đã hoàn thành",
};

export const REQUEST_STATUS_TONE: Record<
    RequestStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    pending: "gray",
    acknowledged: "blue",
    in_progress: "yellow",
    needs_info: "red",
    awaiting_confirmation: "blue",
    resolved: "green",
};

export const REQUEST_PRIORITY_LABEL: Record<RequestPriority, string> = {
    normal: "Bình thường",
    high: "Cao",
    urgent: "Khẩn cấp",
};

export const TRANG_THAI_PHAN_ANH_TONE: Record<
    TrangThaiPhanAnh,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    moi_tiep_nhan: "gray",
    da_tiep_nhan: "blue",
    dang_xu_ly: "yellow",
    da_chuyen_ubnd: "blue",
    da_xu_ly: "green",
    hoan_thanh: "green",
    dong: "gray",
    can_bo_sung: "red",
};

export const LOAI_YEU_CAU_HO_TRO_LABEL: Record<LoaiYeuCauHoTro, string> = {
    bao_loi: "Báo lỗi ứng dụng",
    gop_y: "Góp ý ứng dụng",
    ho_tro_ho_dan: "Hỗ trợ hộ dân",
};

export const TRANG_THAI_YEU_CAU_HO_TRO_LABEL: Record<
    TrangThaiYeuCauHoTro,
    string
> = {
    moi: "Mới",
    dang_xu_ly: "Đang xử lý",
    can_bo_sung: "Cần bổ sung thông tin",
    da_xu_ly: "Đã xử lý",
    dong: "Đóng",
};

export const TRANG_THAI_YEU_CAU_HO_TRO_TONE: Record<
    TrangThaiYeuCauHoTro,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    moi: "gray",
    dang_xu_ly: "yellow",
    can_bo_sung: "red",
    da_xu_ly: "green",
    dong: "gray",
};

export const HOUSE_STATUS_LABEL: Record<HouseStatus, string> = {
    unverified: "Chưa xác thực",
    pending: "Chờ duyệt",
    verified: "Đã xác thực",
    denied: "Từ chối",
    needs_update: "Cần bổ sung thông tin",
    locked: "Đã khóa",
};

export const HOUSE_PHYSICAL_STATUS_LABEL: Record<HousePhysicalStatus, string> =
    {
        not_handed_over: "Chưa bàn giao",
        not_renovated: "Chưa sửa",
        under_construction: "Đang hoàn thiện",
        under_renovation: "Đang sửa",
        completed: "Đã hoàn thiện",
        in_use: "Đang sử dụng",
        vacant: "Để trống",
        damaged: "Xuống cấp",
    };

export const HOUSE_USAGE_TYPE_LABEL: Record<HouseUsageType, string> = {
    household: "Hộ dân",
    business: "Hộ kinh doanh",
    company: "Công ty",
};

export const HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL: Record<
    HouseOwnershipRelationshipType,
    string
> = {
    primary_owner: "Chủ sở hữu chính",
    co_owner: "Đồng sở hữu",
    authorized_manager: "Người được ủy quyền quản lý",
    legal_representative: "Người đại diện pháp luật",
    contact_person: "Người liên hệ",
};

export const HOUSE_OWNERSHIP_VERIFICATION_STATUS_LABEL: Record<
    HouseOwnershipVerificationStatus,
    string
> = {
    waiting_verification: "Chờ xác thực",
    verified: "Đã xác thực",
    rejected: "Bị từ chối",
};

export const HOUSE_OWNERSHIP_VERIFICATION_STATUS_TONE: Record<
    HouseOwnershipVerificationStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    waiting_verification: "yellow",
    verified: "green",
    rejected: "red",
};

export const HOUSE_STATUS_TONE: Record<
    HouseStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    unverified: "gray",
    pending: "yellow",
    verified: "green",
    denied: "red",
    needs_update: "yellow",
    locked: "gray",
};

// Household/Business dung chung bo trang thai xac thuc voi House (xem @dts
// VerificationStatus) - doc lap voi nhau ve gia tri, nhung cung mot 5-trang-thai
// nen tai su dung nguyen nhan/mau cua HOUSE_STATUS_LABEL/_TONE.
export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> =
    HOUSE_STATUS_LABEL;
export const VERIFICATION_STATUS_TONE: Record<
    VerificationStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = HOUSE_STATUS_TONE;

export const BUSINESS_DOCUMENT_STATUS_LABEL: Record<
    BusinessDocumentStatus,
    string
> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối, cần bổ sung",
};

export const BUSINESS_DOCUMENT_STATUS_TONE: Record<
    BusinessDocumentStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    pending: "yellow",
    approved: "green",
    rejected: "red",
};

export const LOAI_SO_HUU_LABEL: Record<LoaiSoHuu, string> = {
    chinh_chu: "Chính chủ",
    cho_thue: "Cho thuê",
};

export const GIOI_TINH_LABEL: Record<GioiTinh, string> = {
    nam: "Nam",
    nu: "Nữ",
    khac: "Khác",
};

export const LOAI_CU_TRU_LABEL: Record<LoaiCuTru, string> = {
    thuong_tru: "Thường trú",
    tam_tru: "Tạm trú",
};

export const MUC_NGUY_CO_PCCC_LABEL: Record<MucNguyCoPccc, string> = {
    xanh: "Xanh",
    vang: "Vàng",
    do: "Đỏ",
};

export const MUC_DO_AN_NINH_LABEL: Record<MucDoAnNinh, string> = {
    binh_thuong: "Bình thường",
    can_theo_doi: "Cần theo dõi",
    khan_cap: "Khẩn cấp",
};

export const LOAI_THONG_BAO_LABEL: Record<LoaiThongBao, string> = {
    chung: "Thông báo chung",
    hop_dan: "Họp dân",
    pccc: "PCCC",
    ve_sinh_moi_truong: "Vệ sinh môi trường",
    an_ninh_trat_tu: "An ninh trật tự",
    khac: "Khác",
};

export const DANG_KY_HOP_LABEL: Record<DangKyHop, string> = {
    co: "Có",
    khong: "Không",
    uy_quyen: "Ủy quyền",
};

export const LOAI_CAU_HOI_KHAO_SAT_LABEL: Record<LoaiCauHoiKhaoSat, string> = {
    dong_y_khong_dong_y: "Đồng ý / Không đồng ý",
    chon_mot: "Chọn một",
    chon_nhieu: "Chọn nhiều",
    y_kien_khac: "Ý kiến khác",
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
    cho_xac_nhan: "Chờ xác nhận",
    da_xac_nhan: "Đã xác nhận",
    da_check_in: "Đã check-in",
    hoan_thanh: "Hoàn thành",
    tu_choi: "Từ chối",
    da_huy: "Đã hủy",
    vang_mat: "Vắng mặt",
};

export const APPOINTMENT_STATUS_TONE: Record<
    AppointmentStatus,
    "gray" | "blue" | "yellow" | "green" | "red"
> = {
    cho_xac_nhan: "yellow",
    da_xac_nhan: "blue",
    da_check_in: "blue",
    hoan_thanh: "green",
    tu_choi: "red",
    da_huy: "gray",
    vang_mat: "red",
};
