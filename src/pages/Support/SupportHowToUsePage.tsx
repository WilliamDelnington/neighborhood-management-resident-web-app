import React, { useState } from "react";
import { Box, Icon, Text } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";

interface Guide {
    key: string;
    title: string;
    content: string;
}

const GUIDES: Guide[] = [
    {
        key: "complaints",
        title: "Gửi và tra cứu phản ánh",
        content:
            'Vào mục "Phản ánh của tôi" ở trang chủ để xem danh sách phản ánh bạn đã gửi và bấm nút "+" để gửi phản ánh mới về các vấn đề an ninh trật tự, vệ sinh môi trường, hạ tầng điện nước... Bạn cũng có thể tra cứu tiến độ xử lý bằng mã phản ánh ngay trên mục này.',
    },
    {
        key: "announcements",
        title: "Xem thông báo",
        content:
            'Bấm vào biểu tượng chuông ở đầu trang chủ để xem thông báo, gồm hai tab: "Thông báo chung" (thông báo từ tổ dân phố như lịch họp, phòng chống dịch bệnh, an ninh trật tự...) và "Của tôi" (thông báo riêng cho tài khoản của bạn). Bạn cũng có thể bật nhận thông báo đẩy trong mục Tài khoản để không bỏ lỡ thông báo mới.',
    },
    {
        key: "meetings",
        title: "Đăng ký tham dự cuộc họp",
        content:
            'Mục "Lịch họp" hiển thị các cuộc họp sắp diễn ra. Chọn một cuộc họp để xem chi tiết và đăng ký tham dự (hoặc ủy quyền cho người khác tham dự thay).',
    },
    {
        key: "surveys",
        title: "Trả lời khảo sát",
        content:
            'Mục "Khảo sát" hiển thị các khảo sát đang mở. Chọn một khảo sát để trả lời các câu hỏi - kết quả sẽ được tổng hợp để phục vụ công tác quản lý của tổ dân phố.',
    },
    {
        key: "files",
        title: "Tải biểu mẫu, tài liệu",
        content:
            'Mục "Biểu mẫu" chứa các tài liệu, biểu mẫu do tổ dân phố cung cấp. Chọn một tài liệu để xem hoặc tải về.',
    },
    {
        key: "account",
        title: "Quản lý tài khoản",
        content:
            "Vào mục Tài khoản để cập nhật thông tin cá nhân, đặt mật khẩu đăng nhập, bật/tắt nhận thông báo, hoặc liên kết hộ khẩu/nhân khẩu của bạn.",
    },
];

const SupportHowToUsePage: React.FC = () => (
    <RequireAuth>
        <SupportHowToUsePageContent />
    </RequireAuth>
);

const SupportHowToUsePageContent: React.FC = () => {
    const [expandedKey, setExpandedKey] = useState<string | null>(
        GUIDES[0]?.key || null,
    );

    return (
        <PageLayout id="support-how-to-use-page" title="Hướng dẫn sử dụng">
            <Box p={4}>
                {GUIDES.map(guide => {
                    const expanded = expandedKey === guide.key;
                    return (
                        <Box
                            key={guide.key}
                            className="bg-white rounded-2xl p-4 shadow-sm mt-3 first:mt-0"
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                onClick={() =>
                                    setExpandedKey(expanded ? null : guide.key)
                                }
                            >
                                <Text.Title size="small">
                                    {guide.title}
                                </Text.Title>
                                <Icon
                                    icon={
                                        expanded
                                            ? "zi-chevron-up"
                                            : "zi-chevron-down"
                                    }
                                    className="text-text_3"
                                />
                            </Box>
                            {expanded && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-2"
                                >
                                    {guide.content}
                                </Text>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </PageLayout>
    );
};

export default SupportHowToUsePage;
