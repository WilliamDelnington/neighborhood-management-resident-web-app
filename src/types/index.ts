import type { FC } from "react";

export type ApiResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
};

export type PaginatedData<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type AppError = {
    status?: number;
    message: string;
};

// ---------------------------------------------------------------------------
// Nguoi dung / vai tro
// ---------------------------------------------------------------------------
export type Role =
    | "house_owner"
    | "neighborhood_leader"
    // To pho - cung quyen dat lich ho (proxy booking) nhu To truong, xem
    // AppointmentBookingPage.tsx. Chua co trong Record<Role,...> nao khac
    // ngoai ROLE_LABEL truoc day - da them nhan tuong ung.
    | "neighborhood_coleader"
    | "secretary"
    | "regional_police"
    | "people_committee_official"
    | "admin";

export type UserStatus = "active" | "pending" | "locked";

export type User = {
    id: string;
    zaloUserId?: string;
    displayName: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
    address?: string;
    roles: Role[];
    primaryRole: Role;
    permissions: string[];
    status: UserStatus;
    householdId?: string;
    citizenId?: string;
    assignedClusters: string[];
    notificationPermission: boolean;
    createdAt?: string;
};

// ---------------------------------------------------------------------------
// Ho dan / nhan khau
// ---------------------------------------------------------------------------
export type LoaiSoHuu = "chinh_chu" | "cho_thue";
export type GioiTinh = "nam" | "nu" | "khac";
export type LoaiCuTru = "thuong_tru" | "tam_tru";

export type HouseStatus =
    | "unverified"
    | "pending"
    | "verified"
    | "denied"
    | "needs_update"
    | "locked";

// Trang thai xac thuc dung chung cho House/Household/Business - ba thuc the
// nay co trang thai xac thuc DOC LAP voi nhau (chi phu thuoc nhau mot chieu
// qua cascade khi House chuyen sang "verified"), nhung dung chung mot bo 5 gia
// tri nhu HouseStatus. Household/Business dung alias nay cho truong `status`
// cua chung thay vi mot enum rieng.
export type VerificationStatus = HouseStatus;

// Tinh trang cong trinh thuc te - doc lap voi HouseStatus (trang thai ho
// so/xac thuc). Optional: nha chua duoc khai se khong co gia tri nay.
export type HousePhysicalStatus =
    | "not_handed_over"
    | "not_renovated"
    | "under_construction"
    | "under_renovation"
    | "completed"
    | "in_use"
    | "vacant"
    | "damaged";

// Nha so co the thuoc ca nhan hoac to chuc - xem Organization ben duoi.
export type OwnerType = "user" | "organization";

export type Street = {
    _id: string;
    name: string;
    code: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

// To dan pho la thuoc tinh rieng cua nha so, KHONG suy ra tu Street (mot
// duong/pho co the chay qua nhieu to dan pho) - xem models/HouseRecord.ts o
// backend.
export type Neighborhood = {
    _id: string;
    name: string;
    code: string;
    sequence: number;
    active: boolean;
    address?: string;
    description?: string;
    contactPhone?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
};

// Muc dich su dung nha do chu nha tu khai bao (co the nhieu gia tri dong
// thoi) - xem models/HouseRecord.ts o backend. Doc lap voi HouseUsageUnit
// (lop gan don vi cho tung Household/Business/Company DA TON TAI, chua co o
// app nay) - truong nay chi la "y dinh" khai bao, dung de nhac nho khai bao
// thieu (xem HouseDetailPage.tsx).
export const HOUSE_USAGE_TYPE = ["household", "business", "company"] as const;
export type HouseUsageType = typeof HOUSE_USAGE_TYPE[number];

export type House = {
    _id: string;
    code: string;
    cluster: string;
    // streetId/neighborhoodId duoc backend populate voi "name code" luc doc
    // (xem HOUSE_RECORD_POPULATE), van la id tho luc chi vua tao/cap nhat.
    streetId?: string | Street | null;
    neighborhoodId?: string | Neighborhood | null;
    address: string;
    status: HouseStatus;
    physicalStatus?: HousePhysicalStatus;
    usageTypes: HouseUsageType[];
    otherUsageNote?: string;
    // Cache cua quan he primary_owner dang active trong HouseOwnership (xem
    // ben duoi) - mot nha co the co nhieu chu so huu/nguoi quan ly dong thoi,
    // hai truong nay chi phan anh chu so huu CHINH hien tai.
    ownerType?: OwnerType;
    // ownerId khong duoc backend populate (van la id tho) - khi ownerType la
    // "organization", frontend tu goi fetchOrganizationById de biet
    // representativeUserId (xem HouseDetailPage.tsx).
    ownerId?: string | { _id: string; displayName: string };
    note?: string;
    approvalNote?: string;
    denialReason?: string;
    needsUpdateNote?: string;
    residenceDeclarationNumber?: string;
    createdAt: string;
    updatedAt: string;
};

// Ket qua rut gon tu GET /api/houses/lookup - dung rieng cho luong chon "nha
// so lien quan" khi gui phan anh (khong loc theo pham vi so huu/phu trach,
// khong tra ve du lieu nhay cam nhu chu so huu/trang thai xac minh).
export type HouseLookupItem = {
    _id: string;
    code: string;
    address?: string;
    cluster?: string;
};

export type HouseOwnershipRelationshipType =
    | "primary_owner"
    | "co_owner"
    | "authorized_manager"
    | "legal_representative"
    | "contact_person";

export type HouseOwnershipVerificationStatus =
    | "waiting_verification"
    | "verified"
    | "rejected";

// ownerId luon la id tho (khong duoc backend populate, vi la ref da hinh User/
// Organization) - ownerDisplayName/ownerPhone duoc backend tu resolve rieng
// (xem houseOwnershipService.listHouseOwnerships) de khong phai goi them API
// ma house_owner thuong khong co quyen goi (vd tim User theo id).
export type HouseOwnership = {
    _id: string;
    houseId: string;
    ownerType: OwnerType;
    ownerId: string;
    ownerDisplayName?: string;
    ownerPhone?: string;
    relationshipType: HouseOwnershipRelationshipType;
    startDate: string;
    endDate?: string | null;
    active: boolean;
    verificationStatus: HouseOwnershipVerificationStatus;
    reason?: string;
    createdAt: string;
    updatedAt: string;
};

export type OrganizationType =
    | "cong_ty"
    | "hop_tac_xa"
    | "co_quan_nha_nuoc"
    | "khac";

export type Organization = {
    _id: string;
    name: string;
    taxCode?: string;
    organizationType: OrganizationType;
    representativeUserId:
        | string
        | { _id: string; displayName: string; phone?: string };
    representativeRole?: string;
    phone?: string;
    email?: string;
    address?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Household = {
    _id: string;
    code: string;
    cluster: string;
    address: string;
    headOfHousehold: string;
    phone?: string;
    memberCount: number;
    ownershipType: LoaiSoHuu;
    needsSupport: boolean;
    houseId?: string | House;
    status: VerificationStatus;
    approvalNote?: string;
    denialReason?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
};

export type DocumentType = {
    _id: string;
    name: string;
    code: string;
    description?: string;
    hasIssueDate: boolean;
    hasExpiryDate: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type BusinessTypeDocumentRule = {
    _id?: string;
    documentTypeId: string | DocumentType;
    isRequired: boolean;
    warningBeforeDays?: number;
    // Rong = fallback ve permission "businesses.verify" khi duyet giay to nay.
    reviewerRoles: string[];
};

export type BusinessType = {
    _id: string;
    name: string;
    description?: string;
    active: boolean;
    sortOrder: number;
    requiredDocuments: BusinessTypeDocumentRule[];
    createdAt: string;
    updatedAt: string;
};

export type BusinessDocumentStatus = "pending" | "approved" | "rejected";

export type Business = {
    _id: string;
    name: string;
    houseId: string | House;
    cluster: string;
    businessType?: string | BusinessType;
    ownerName?: string;
    // Khong bat buoc - khong phai ho kinh doanh nao cung da dang ky ma so
    // thue (xem models/Business.ts o backend).
    taxCode?: string;
    phone?: string;
    active: boolean;
    status: VerificationStatus;
    approvalNote?: string;
    denialReason?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
};

// Mirror cua Business nhung khong co businessType/quy trinh giay to rieng -
// xem models/Company.ts o backend.
export type Company = {
    _id: string;
    name: string;
    houseId: string | House;
    cluster: string;
    ownerName?: string;
    // Bat buoc o Company (khac Business) - xem models/Company.ts o backend.
    taxCode: string;
    // Lien ket tuy chon toi mot Organization co san - chua co UI chon/hien thi
    // trong mini app (chi admin web app), them field de du lieu day du khi
    // can dung sau nay.
    organizationId?: { _id: string; name: string } | string | null;
    phone?: string;
    active: boolean;
    status: VerificationStatus;
    approvalNote?: string;
    denialReason?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
};

// Rut gon tu HouseUsageUnit o backend, populate san ten hien thi cua doi tuong
// da gan (chinh xac MOT trong ba truong duoi day co gia tri, khop usageType) -
// dung cho man "Nha cua toi" (xem app/api/houses/mine o backend), khong can
// goi rieng cac API households/businesses/companies.
export type MyHouseUsageUnit = {
    _id: string;
    unitLabel: string;
    usageType: HouseUsageType;
    // Backend populate dung MOT trong ba truong nay (khop usageType) - xem
    // houseUsageUnitService.listHouseUsageUnitsByHouse.
    householdId?: {
        _id: string;
        code: string;
        headOfHousehold?: string;
        status: VerificationStatus;
    } | null;
    businessId?: {
        _id: string;
        name: string;
        status: VerificationStatus;
    } | null;
    companyId?: {
        _id: string;
        name: string;
        status: VerificationStatus;
    } | null;
    note?: string;
};

// Ket qua GET /api/houses/mine - mot phan tu cho moi nha ma nguoi dang dang
// nhap dang "thao tac thay chu nha" (co the nhieu hon mot, xem
// houseOwnershipService.getHouseIdsForActingOwner o backend).
export type MyHouseOverviewItem = {
    house: House;
    ownerships: HouseOwnership[];
    usageUnits: MyHouseUsageUnit[];
};

// Ket qua GET /api/dashboard/mine (C01) - moi so lieu chi tinh tren du lieu
// CUA CHINH nguoi dang dang nhap, khac dashboard thong ke cho nhan vien
// (xem dashboardService.getMyHouseDashboard o backend).
export type MyHouseDashboard = {
    unreadNotifications: number;
    myRequestCounts: { inProgress: number; dueSoon: number; overdue: number };
    activeComplaints: number;
    openSupportTickets: number;
    pendingSurveys: number;
    upcomingMeetings: Array<{
        id: string;
        title: string;
        startTime: string;
        location?: string;
    }>;
    hasLinkedHouse: boolean;
};

// Ket qua GET /api/neighborhoods/mine (C03) - cac truong cong khai an toan
// cua to dan pho gan voi nha cua nguoi dang dang nhap (xem
// app/api/neighborhoods/mine o backend).
export type MyNeighborhoodInfo = {
    neighborhood: {
        _id: string;
        name: string;
        address?: string;
        description?: string;
        contactPhone?: string;
        leaderUserId?: {
            _id: string;
            displayName: string;
            phone?: string;
        } | null;
    };
    coleaders: Array<{
        _id: string;
        coleaderUserId: { _id: string; displayName: string; phone?: string };
    }>;
};

type PopulatedFileAssetSummary = {
    _id: string;
    name: string;
    url: string;
    mimeType?: string;
    sizeBytes?: number;
};
type PopulatedActor = { _id: string; displayName: string };

export type BusinessDocument = {
    _id: string;
    businessId: string;
    documentTypeId: string | DocumentType;
    fileAssetId: string | PopulatedFileAssetSummary;
    docNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    status: BusinessDocumentStatus;
    rejectionReason?: string;
    uploadedBy: string | PopulatedActor;
    reviewedBy?: string | PopulatedActor;
    reviewedAt?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type RequiredDocumentItem = {
    rule: BusinessTypeDocumentRule;
    activeDocument: BusinessDocument | null;
    history: BusinessDocument[];
    missing: boolean;
    expired: boolean;
};

export type RequiredDocumentsResult = {
    business: Business;
    items: RequiredDocumentItem[];
};

export type Citizen = {
    _id: string;
    fullName: string;
    phone?: string;
    cccd?: string;
    birthDate?: string;
    gender: GioiTinh;
    relationToHead?: string;
    householdId: string | Household;
    residenceType: LoaiCuTru;
    temporaryResidenceExpiresAt?: string;
    isElderly: boolean;
    isChild: boolean;
    isDisabledOrSupportNeeded: boolean;
    isPartyMember: boolean;
    isUnionMember: boolean;
    createdAt: string;
    updatedAt: string;
};

// ---------------------------------------------------------------------------
// Phan anh kien nghi
// ---------------------------------------------------------------------------
// Truoc la mot union co dinh (danh sach 10 nhom cu) - nay category la key cua
// mot ComplaintTypeDefinition quan tri duoc qua man Loai phan anh (admin app).
export type NhomPhanAnh = string;

export type ComplaintTypeDefinition = {
    _id?: string;
    key: string;
    name: string;
    description?: string;
    isBuiltIn?: boolean;
    active?: boolean;
};

export type TrangThaiPhanAnh =
    | "moi_tiep_nhan"
    | "da_tiep_nhan"
    | "dang_xu_ly"
    | "da_chuyen_ubnd"
    | "da_xu_ly"
    | "hoan_thanh"
    | "dong"
    | "can_bo_sung";

export type ComplaintTimelineAction =
    | "status_update"
    | "edited"
    | "reevaluation_request";

export type Complaint = {
    _id: string;
    code: string;
    category: NhomPhanAnh;
    title: string;
    content: string;
    area?: string;
    status: TrangThaiPhanAnh;
    createdByUserId:
        | string
        | { _id: string; displayName: string; phone?: string };
    assigneeId?: string | { _id: string; displayName: string };
    expectedCompletionDate?: string;
    actualCompletionDate?: string;
    escalatedToCommittee: boolean;
    internalNotes?: string;
    rating?: number;
    ratingNote?: string;
    createdAt: string;
    updatedAt: string;
};

export type ComplaintTimelineEntry = {
    _id: string;
    complaintId: string;
    status: TrangThaiPhanAnh;
    action: ComplaintTimelineAction;
    note?: string;
    patch?: Record<string, unknown>;
    previousSnapshot?: Record<string, unknown>;
    isPublic: boolean;
    actorId: string;
    createdAt: string;
};

export type ComplaintDetail = {
    complaint: Complaint;
    timeline: ComplaintTimelineEntry[];
};

// ---------------------------------------------------------------------------
// Van ban (Cong van/Bao cao/De xuat/Kien nghi... - ca hai chieu Ward <-> To truong)
// ---------------------------------------------------------------------------
export type ChangeRequestTargetModel =
    | "HouseRecord"
    | "HouseOwnership"
    | "User";
export type ChangeRequestType = "update" | "unlink";
export type ChangeRequestStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export type ChangeRequest = {
    _id: string;
    targetModel: ChangeRequestTargetModel;
    targetId: string;
    requestedBy: string | { _id: string; displayName: string };
    changeType: ChangeRequestType;
    patch?: Record<string, unknown>;
    previousSnapshot?: Record<string, unknown>;
    reason?: string;
    status: ChangeRequestStatus;
    decidedBy?: string | { _id: string; displayName: string };
    decidedAt?: string;
    decisionNote?: string;
    createdAt: string;
};

export type CorrespondenceType = {
    _id: string;
    name: string;
    code: string;
    description?: string;
    allowedSenderRoles: Role[];
    allowedReceiverRoles: Role[];
    requireDocumentNumber: boolean;
    active: boolean;
};

export type CorrespondenceStatus = "nhap" | "da_gui";

export type Correspondence = {
    _id: string;
    correspondenceTypeId:
        | string
        | Pick<CorrespondenceType, "_id" | "name" | "code">;
    documentNumber?: string;
    title: string;
    content: string;
    issuedAt: string;
    status: CorrespondenceStatus;
    isUrgent: boolean;
    senderId: string;
    targetNeighborhoodIds: string[];
    targetUserIds: string[];
    sentAt?: string;
    createdAt: string;
};

export type CorrespondenceReply = {
    _id: string;
    correspondenceId: string;
    content: string;
    actorId: { _id: string; displayName: string } | string;
    createdAt: string;
};

export type AssignableStaff = {
    id: string;
    displayName: string;
};

// ---------------------------------------------------------------------------
// Ho tro (Ho so ca nhan)
// ---------------------------------------------------------------------------
export type LoaiYeuCauHoTro = "bao_loi" | "gop_y" | "ho_tro_ho_dan";

export type TrangThaiYeuCauHoTro =
    | "moi"
    | "dang_xu_ly"
    | "can_bo_sung"
    | "da_xu_ly"
    | "dong";

export type SupportTicket = {
    _id: string;
    code: string;
    type: LoaiYeuCauHoTro;
    title: string;
    content: string;
    images: string[];
    deviceInfo?: string;
    status: TrangThaiYeuCauHoTro;
    createdByUserId:
        | string
        | { _id: string; displayName: string; phone?: string };
    adminResponse?: string;
    respondedByUserId?: string | { _id: string; displayName: string };
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
};

// ---------------------------------------------------------------------------
// Thong bao / cuoc hop / khao sat (mo rong khi cac module lien quan hoan tat)
// ---------------------------------------------------------------------------
export type LoaiThongBao =
    | "chung"
    | "hop_dan"
    | "pccc"
    | "ve_sinh_moi_truong"
    | "an_ninh_trat_tu"
    | "khac";

export type Announcement = {
    _id: string;
    title: string;
    content: string;
    category: LoaiThongBao;
    status: "nhap" | "da_dang";
    priority: boolean;
    pinned: boolean;
    isUrgent: boolean;
    // undefined/null = dang boi Phuong (admin/secretary); co gia tri = dang
    // boi To dan pho cu the - xem models/Announcement.ts o backend.
    neighborhoodId?: { _id: string; name: string } | string | null;
    publishedAt?: string;
    createdAt: string;
};

export type DangKyHop = "co" | "khong" | "uy_quyen";

export type Meeting = {
    _id: string;
    title: string;
    startTime: string;
    location: string;
    content: string;
    minutes?: string;
    published: boolean;
    createdAt: string;
};

export type LoaiCauHoiKhaoSat =
    | "dong_y_khong_dong_y"
    | "chon_mot"
    | "chon_nhieu"
    | "y_kien_khac";

export type SurveyQuestion = {
    _id: string;
    question: string;
    type: LoaiCauHoiKhaoSat;
    options: string[];
    required: boolean;
};

export type Survey = {
    _id: string;
    title: string;
    description?: string;
    questions: SurveyQuestion[];
    status: "nhap" | "dang_mo" | "da_dong";
    openDate?: string;
    closeDate?: string;
    createdAt: string;
};

export type MucNguyCoPccc = "xanh" | "vang" | "do";
export type MucDoAnNinh = "binh_thuong" | "can_theo_doi" | "khan_cap";

export type FileAsset = {
    _id: string;
    name: string;
    description?: string;
    url: string;
    category: "form" | "attachment" | "minutes" | "other";
    isPublic: boolean;
    createdAt: string;
};

export type AppNotification = {
    deliveryId: string;
    notification: {
        _id: string;
        title: string;
        body: string;
        type: string;
        relatedModel?: string;
        relatedId?: string;
        createdAt: string;
    };
    readAt?: string;
    sentAt?: string;
};

export type Utinity = {
    key: string;
    label: string;
    icon?: FC<any>;
    iconSrc?: string;
    color?: string;
    bgColor?: string;
    path?: string;
    link?: string;
    inDevelopment?: boolean;
    phoneNumber?: string;
    requiredPermission?: string;
    showBadge?: boolean;
};

// ---------------------------------------------------------------------------
// Yeu cau cong viec (Request) - chi phan resident-facing (xem "cua toi": nhan
// nhiem vu tu To truong/To pho, tu cap nhat trang thai). Khong bao gom phan
// tao/gan cua nhan vien (chi co o admin web).
// ---------------------------------------------------------------------------
export const REQUEST_TYPES = ["pccc", "security", "other", "task"] as const;
export type RequestType = typeof REQUEST_TYPES[number];

export const REQUEST_STATUSES = [
    "pending",
    "acknowledged",
    "in_progress",
    "needs_info",
    "awaiting_confirmation",
    "resolved",
] as const;
export type RequestStatus = typeof REQUEST_STATUSES[number];

export const REQUEST_PRIORITIES = ["normal", "high", "urgent"] as const;
export type RequestPriority = typeof REQUEST_PRIORITIES[number];

// Dung chung cho trao doi tren Request VA SupportTicket (C12) - cung mo hinh
// Comment o backend, chi khac entityType.
export type RequestComment = {
    _id: string;
    entityType: "Request" | "SupportTicket";
    entityId: string;
    authorId: string | { _id: string; displayName: string };
    content: string;
    createdAt: string;
};

export type MyRequestItem = {
    _id: string;
    requestId: string;
    type: RequestType;
    title: string;
    description?: string;
    priority: RequestPriority;
    houseId?: string | { _id: string; code: string; address: string } | null;
    dueDate?: string;
    createdBy?: string | { _id: string; displayName: string };
    createdAt: string;
    status: RequestStatus;
    note?: string;
    respondedAt?: string;
    resolvedAt?: string;
    isOverdue: boolean;
};

// ---------------------------------------------------------------------------
// Rà soát / chiến dịch (B07)
// ---------------------------------------------------------------------------
export type InspectionCampaignStatus = "DRAFT" | "ACTIVE" | "LOCKED" | "CLOSED";
export type InspectionResultStatus =
    | "PENDING"
    | "DRAFT"
    | "SUBMITTED"
    | "VERIFIED"
    | "REQUEST_REVISION"
    | "FIELD_CHECK_REQUIRED";
export type InspectionOutcome = "PASS" | "FAIL" | "NEEDS_SUPPLEMENT";
export type InspectionChecklistItem = {
    itemId: string;
    label: string;
    inputType: "BOOLEAN" | "TEXT" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT";
    required: boolean;
    options?: string[];
};
export type InspectionSummary = {
    totalHouses: number;
    pass: number;
    fail: number;
    unchecked: number;
    needsSupplement: number;
    pending: number;
    draft: number;
    submitted: number;
    verified: number;
};
export type InspectionCampaign = {
    _id: string;
    name: string;
    purpose: string;
    checklistTemplate: InspectionChecklistItem[];
    allowSelfDeclaration: boolean;
    requiredEvidence: boolean;
    startAt: string;
    dueAt: string;
    status: InspectionCampaignStatus;
    summary?: InspectionSummary;
    availableNeighborhoods?: Array<{ _id: string; code: string; name: string }>;
};
export type InspectionTarget = {
    _id: string;
    campaignId: string;
    houseId:
        | string
        | { _id: string; code: string; address: string; cluster?: string };
    neighborhoodId: string;
    assignedCollaboratorUserId?: string | { _id: string; displayName: string };
    selfDeclarationStatus: "NOT_SENT" | "SENT" | "SUBMITTED";
    resultStatus: InspectionResultStatus;
    result?: {
        _id: string;
        status: InspectionResultStatus;
        outcome?: InspectionOutcome;
    } | null;
    campaign?: InspectionCampaign;
};
export type InspectionResult = {
    _id: string;
    targetId: string;
    submittedBy: "HOUSE" | "NEIGHBORHOOD";
    gpsLat?: number;
    gpsLng?: number;
    note?: string;
    outcome?: InspectionOutcome;
    reviewNote?: string;
    status: InspectionResultStatus;
    target: InspectionTarget;
    campaign: InspectionCampaign;
    answers: Array<{ _id: string; checklistItemId: string; value: unknown }>;
    attachments: FileAsset[];
};
export type InspectionSelfDeclarationDetail = {
    target: InspectionTarget;
    campaign: InspectionCampaign;
    result: null | {
        _id: string;
        targetId: string;
        submittedBy: "HOUSE";
        submittedByUserId: string | { _id: string; displayName: string };
        gpsLat?: number;
        gpsLng?: number;
        note?: string;
        outcome?: InspectionOutcome;
        reviewNote?: string;
        status: InspectionResultStatus;
        submittedAt?: string;
        answers: Array<{
            _id: string;
            checklistItemId: string;
            value: unknown;
        }>;
        attachments: FileAsset[];
    };
};
export type InspectionSelfDeclarationListItem = {
    target: InspectionTarget;
    campaign: InspectionCampaign;
};

export type UtilityApp = {
    _id: string;
    name: string;
    icon: string;
    url: string;
    active: boolean;
    sortOrder: number;
};

// ---------------------------------------------------------------------------
// Dat lich hen (Appointment) - dat lich lam viec voi can bo Phuong/To dan pho
// theo khung gio, nhan ma dat lich, duoc check-in/hoan thanh boi nhan vien
// roi danh gia. Xem appointmentApi.ts.
// ---------------------------------------------------------------------------
export type AppointmentStatus =
    | "cho_xac_nhan"
    | "da_xac_nhan"
    | "da_check_in"
    | "hoan_thanh"
    | "tu_choi"
    | "da_huy"
    | "vang_mat";

export type AppointmentTimeSlot = {
    _id: string;
    dayOfWeek: number; // 1-7, Thu Hai - Chu Nhat
    startTime: string; // "HH:mm"
    endTime: string;
    maxCapacity: number;
    active: boolean;
};

export type AppointmentService = {
    _id: string;
    key: string;
    name: string;
    description?: string;
    locationAddress: string;
    scope: "ward" | "neighborhood";
    slotDurationMinutes: number;
    autoApprove: boolean;
    active: boolean;
    timeSlots: AppointmentTimeSlot[];
};

export type Appointment = {
    _id: string;
    code: string;
    serviceId: string | { _id: string; name: string };
    timeSlotId: string;
    houseId: string | { _id: string; code: string; address?: string };
    citizenUserId?:
        | string
        | { _id: string; displayName: string; phone?: string };
    proxyName?: string;
    proxyPhone?: string;
    bookedByUserId: string | { _id: string; displayName: string };
    appointedDate: string;
    startTime: string;
    endTime: string;
    note?: string;
    status: AppointmentStatus;
    cancelReason?: string;
    checkinTime?: string;
    completedTime?: string;
    rating?: number;
    ratingNote?: string;
    createdAt: string;
    updatedAt: string;
};
