import React from "react";
import { Box, Icon, Text, useNavigate } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";

const SupportPage: React.FC = () => (
    <RequireAuth>
        <SupportPageContent />
    </RequireAuth>
);

interface SupportRowProps {
    title: string;
    description: string;
    onClick: () => void;
}

const SupportRow: React.FC<SupportRowProps> = ({
    title,
    description,
    onClick,
}) => (
    <Box
        className="bg-white rounded-2xl p-4 shadow-card mt-3"
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

const SupportPageContent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageLayout id="support-page" title="Hỗ trợ">
            <Box p={4}>
                <SupportRow
                    title="Hướng dẫn sử dụng"
                    description="Xem hướng dẫn sử dụng các tính năng của ứng dụng"
                    onClick={() =>
                        navigate("/support/how-to-use", { animate: true })
                    }
                />
                <SupportRow
                    title="Yêu cầu hỗ trợ của tôi"
                    description="Xem lại các yêu cầu hỗ trợ bạn đã gửi và trạng thái xử lý"
                    onClick={() =>
                        navigate("/support/tickets/mine", { animate: true })
                    }
                />
                <SupportRow
                    title="Hỗ trợ hộ dân"
                    description="Đề nghị Tổ dân phố/Phường hỗ trợ một vấn đề của gia đình bạn"
                    onClick={() =>
                        navigate("/support/household-assistance", {
                            animate: true,
                        })
                    }
                />
                <SupportRow
                    title="Báo lỗi"
                    description="Báo cho chúng tôi lỗi bạn gặp phải khi sử dụng ứng dụng"
                    onClick={() =>
                        navigate("/support/report-bug", { animate: true })
                    }
                />
                <SupportRow
                    title="Góp ý"
                    description="Gửi góp ý để giúp chúng tôi cải thiện ứng dụng"
                    onClick={() =>
                        navigate("/support/feedback", { animate: true })
                    }
                />
            </Box>
        </PageLayout>
    );
};

export default SupportPage;
