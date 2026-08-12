import React from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { ListRow } from "@components/admin";
import { RequireAuth, hasPermission, hasAdminAccess } from "@components/role";
import { useStore } from "@store";
import { ADMIN_APP_URL } from "@constants/common";
import { openWebView } from "@service/zalo";

const AdminHomePage: React.FC = () => (
    <RequireAuth>
        <AdminHomeContent />
    </RequireAuth>
);

const AdminHomeContent: React.FC = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const isHouseOwner = user?.primaryRole === "house_owner";

    const canViewHouseholds = hasPermission(user, "households.read");
    const canViewCitizens = hasPermission(user, "citizens.read");
    const canViewHouses = hasPermission(user, "houses.read");
    const canViewBusinessTypes = hasPermission(user, "business_types.read");
    const canViewBusinesses = hasPermission(user, "businesses.read");
    const canViewCorrespondences = hasPermission(user, "correspondences.read");

    return (
        <PageLayout
            id="admin-home-page"
            title="Quản trị"
            bottomNav={<AppBottomNav />}
        >
            <Box className="bg-white mt-2">
                {(canViewHouseholds ||
                    canViewCitizens ||
                    canViewHouses ||
                    canViewBusinessTypes ||
                    canViewBusinesses ||
                    canViewCorrespondences) && (
                    <Box px={4}>
                        {canViewHouses && (
                            <ListRow
                                title="Danh sách nhà số"
                                subtitle={
                                    isHouseOwner
                                        ? "Nhà số của bạn"
                                        : "Nhà số trong cụm dân cư bạn phụ trách"
                                }
                                onClick={() =>
                                    navigate("/admin/houses", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                        {canViewHouseholds && (
                            <ListRow
                                title="Danh sách hộ dân"
                                subtitle={
                                    isHouseOwner
                                        ? "Hộ dân trong nhà của bạn"
                                        : "Thông tin các hộ dân trong tổ dân phố"
                                }
                                onClick={() =>
                                    navigate("/admin/households", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                        {canViewCitizens && (
                            <ListRow
                                title="Danh sách nhân khẩu"
                                subtitle={
                                    isHouseOwner
                                        ? "Nhân khẩu trong hộ của bạn"
                                        : "Thông tin nhân khẩu của từng hộ"
                                }
                                onClick={() =>
                                    navigate("/admin/citizens", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                        {canViewBusinesses && (
                            <ListRow
                                title="Danh sách hộ kinh doanh"
                                subtitle={
                                    isHouseOwner
                                        ? "Hộ kinh doanh trong nhà của bạn"
                                        : "Hộ kinh doanh trong tổ dân phố"
                                }
                                onClick={() =>
                                    navigate("/admin/businesses", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                        {canViewBusinessTypes && (
                            <ListRow
                                title="Danh sách loại hình kinh doanh"
                                subtitle="Danh mục loại hình hộ kinh doanh"
                                onClick={() =>
                                    navigate("/admin/business-types", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                        {canViewCorrespondences && (
                            <ListRow
                                title="Văn bản"
                                subtitle="Công văn, báo cáo, đề xuất giữa phường/xã và tổ dân phố"
                                onClick={() =>
                                    navigate("/correspondences", {
                                        animate: true,
                                    })
                                }
                            />
                        )}
                    </Box>
                )}
                {!canViewHouseholds &&
                    !canViewCitizens &&
                    !canViewHouses &&
                    !canViewBusinessTypes &&
                    !canViewBusinesses &&
                    !canViewCorrespondences && (
                        <Box p={6}>
                            <Text
                                size="small"
                                className="text-text_2 text-center"
                            >
                                Tài khoản của bạn chưa được cấp quyền quản trị
                                nào.
                            </Text>
                        </Box>
                    )}
            </Box>

            {/* Trang quan tri web yeu cau quyen "dashboard.read" (xem AdminGuard
            trong admin-web-app/src/App.tsx) - house_owner khong co quyen nay
            nen mo len se chi thay man hinh tu choi truy cap, khong co ich gi
            cho ho. Chi hien lien ket cho cac vai tro nhan vien/admin thuc su
            dung duoc trang do. */}
            {!!ADMIN_APP_URL && hasAdminAccess(user) && (
                <Box p={4}>
                    <Text
                        size="xSmall"
                        className="text-main text-center"
                        onClick={() => openWebView(ADMIN_APP_URL)}
                    >
                        Mở trang quản trị đầy đủ trên web
                    </Text>
                </Box>
            )}
        </PageLayout>
    );
};

export default AdminHomePage;
