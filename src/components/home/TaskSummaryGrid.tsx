import React, { FC } from "react";
import { Text, useNavigate } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import * as Icon from "@components/icons";
import { MyHouseDashboard } from "@dts";

export interface TaskSummaryGridProps {
    dashboard: MyHouseDashboard;
}

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
`;

const Tile = styled.div`
    ${tw`flex flex-col bg-ng_10 rounded-2xl`};
    padding: 14px;
`;

const IconCircle = styled.div<{ $bg: string }>`
    ${tw`rounded-full flex items-center justify-center flex-shrink-0`};
    width: 36px;
    height: 36px;
    background: ${({ $bg }) => $bg};
    svg {
        width: 20px;
        height: 20px;
    }
`;

const Count = styled.div<{ $color: string }>`
    ${tw`font-bold`};
    font-size: 22px;
    line-height: 28px;
    color: ${({ $color }) => $color};
    margin-top: 10px;
`;

type Tone = {
    key: string;
    label: string;
    count: number;
    icon: React.FC<{ color?: string }>;
    color: string;
    bgColor: string;
    onClick: () => void;
};

/**
 * Grid the 4-6 "viec can xu ly" cua Home thanh cac o icon mau (thay cho danh
 * sach hang doc truoc day) - phan anh + ho tro gop chung mot o vi ca hai deu
 * la "khieu nai/yeu cau dang cho xu ly" va man hinh chi co 5 o vua voi luoi 2
 * cot tren mobile.
 */
const TaskSummaryGrid: FC<TaskSummaryGridProps> = ({ dashboard }) => {
    const navigate = useNavigate();

    const requestCount =
        dashboard.myRequestCounts.overdue +
        dashboard.myRequestCounts.dueSoon +
        dashboard.myRequestCounts.inProgress;
    const complaintSupportCount =
        dashboard.activeComplaints + dashboard.openSupportTickets;

    const tiles: Tone[] = [
        requestCount > 0 && {
            key: "requests",
            label: "Nhiệm vụ cần xử lý",
            count: requestCount,
            icon: Icon.BookIcon,
            color: "#DC2626",
            bgColor: "#FEE2E2",
            onClick: () => navigate("/requests/mine"),
        },
        dashboard.unreadNotifications > 0 && {
            key: "notifications",
            label: "Thông báo chưa đọc",
            count: dashboard.unreadNotifications,
            icon: Icon.NotificationIcon,
            color: "#D97706",
            bgColor: "#FEF3C7",
            onClick: () => navigate("/notifications"),
        },
        complaintSupportCount > 0 && {
            key: "complaints-support",
            label: "Phản ánh & hỗ trợ",
            count: complaintSupportCount,
            icon: Icon.HeadsetIcon,
            color: "#4338CA",
            bgColor: "#E0E7FF",
            onClick: () =>
                navigate(
                    dashboard.activeComplaints > 0
                        ? "/complaints/lookup"
                        : "/support",
                ),
        },
        dashboard.pendingSurveys > 0 && {
            key: "surveys",
            label: "Khảo sát chưa trả lời",
            count: dashboard.pendingSurveys,
            icon: Icon.QAndAIcon,
            color: "#16A34A",
            bgColor: "#DCFCE7",
            onClick: () => navigate("/surveys"),
        },
        dashboard.upcomingMeetings.length > 0 && {
            key: "meetings",
            label: "Cuộc họp sắp tới",
            count: dashboard.upcomingMeetings.length,
            icon: Icon.CalendarIcon,
            color: "#0891B2",
            bgColor: "#CFFAFE",
            onClick: () => navigate("/meetings"),
        },
    ].filter((tile): tile is Tone => Boolean(tile));

    if (tiles.length === 0) {
        return (
            <Text size="xSmall" className="text-text_2">
                Không có việc cần xử lý.
            </Text>
        );
    }

    return (
        <Grid>
            {tiles.map(tile => {
                const TileIcon = tile.icon;
                return (
                    <Tile key={tile.key} onClick={tile.onClick}>
                        <IconCircle $bg={tile.bgColor}>
                            <TileIcon color={tile.color} />
                        </IconCircle>
                        <Text size="xSmall" className="text-text_2 mt-2">
                            {tile.label}
                        </Text>
                        <Count $color={tile.color}>{tile.count}</Count>
                    </Tile>
                );
            })}
        </Grid>
    );
};

export default TaskSummaryGrid;
