import React from "react";
import { Box, Icon, Text, useNavigate } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";

const InteractionHistoryPage: React.FC = () => (
    <RequireAuth>
        <InteractionHistoryContent />
    </RequireAuth>
);

interface HistoryLinkProps {
    title: string;
    description: string;
    onClick: () => void;
}

const HistoryLink: React.FC<HistoryLinkProps> = ({
    title,
    description,
    onClick,
}) => (
    <Box
        className="bg-white rounded-2xl p-4 shadow-sm mt-3"
        flex
        justifyContent="space-between"
        alignItems="center"
        onClick={onClick}
    >
        <Box style={{ flex: 1 }}>
            <Text.Title size="small">{title}</Text.Title>
            <Text size="xxSmall" className="text-text_2 mt-1">
                {description}
            </Text>
        </Box>
        <Icon icon="zi-chevron-right" className="text-text_3" />
    </Box>
);

/**
 * "Lich su tuong tac" (C13) - KHONG phai mot mo hinh du lieu/aggregate moi,
 * chi la trang gom lien ket toi lich su rieng cua tung phan he da co san
 * (Nhiem vu, Phan anh, Ho tro, Doi thong tin, Khao sat, Lich hop, Thong bao)
 * - dung theo dung khuyen nghi cua tai lieu doi chieu: "bat dau bang lien ket
 * toi lich su co san cua tung phan he, chi xay read-model tong hop rieng neu
 * nguoi dung thuc su can tim kiem/loc xuyen phan he".
 */
const InteractionHistoryContent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageLayout id="interaction-history-page" title="Lịch sử tương tác">
            <Box p={4}>
                <HistoryLink
                    title="Nhiệm vụ của tôi"
                    description="Các nhiệm vụ được Tổ dân phố/Phường giao"
                    onClick={() =>
                        navigate("/requests/mine", { animate: true })
                    }
                />
                <HistoryLink
                    title="Phản ánh của tôi"
                    description="Các phản ánh bạn đã gửi và tiến độ xử lý"
                    onClick={() =>
                        navigate("/complaints/lookup", { animate: true })
                    }
                />
                <HistoryLink
                    title="Yêu cầu hỗ trợ của tôi"
                    description="Các yêu cầu hỗ trợ/báo lỗi/góp ý bạn đã gửi"
                    onClick={() =>
                        navigate("/support/tickets/mine", { animate: true })
                    }
                />
                <HistoryLink
                    title="Yêu cầu thay đổi thông tin"
                    description="Đề nghị sửa thông tin, hủy liên kết nhà đã gửi"
                    onClick={() =>
                        navigate("/change-requests/mine", { animate: true })
                    }
                />
                <HistoryLink
                    title="Khảo sát"
                    description="Các khảo sát bạn đã hoặc chưa trả lời"
                    onClick={() => navigate("/surveys", { animate: true })}
                />
                <HistoryLink
                    title="Lịch họp"
                    description="Các cuộc họp và lịch sử đăng ký tham dự"
                    onClick={() => navigate("/meetings", { animate: true })}
                />
                <HistoryLink
                    title="Thông báo đã nhận"
                    description="Thông báo và tin tức đã gửi tới bạn"
                    onClick={() =>
                        navigate("/notifications", { animate: true })
                    }
                />
            </Box>
        </PageLayout>
    );
};

export default InteractionHistoryPage;
