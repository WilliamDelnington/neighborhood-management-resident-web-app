import React, { FC } from "react";
import { Icon } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";

export interface HomeInfoBannerHouse {
    code: string;
    address: string;
    statusLabel: string;
    verified: boolean;
    ownerName?: string;
}

export interface HomeInfoBannerProps {
    title: string;
    address: string;
    house?: HomeInfoBannerHouse;
    onViewDetail?: () => void;
    /** Tổng số thông báo chưa đọc - hiện chip nhắc nếu > 0 (chỉ ở biến thể mặc định). */
    unreadCount?: number;
}

const Wrapper = styled.div`
    ${tw`rounded-2xl text-white relative overflow-hidden`};
    margin: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #05aac0 0%, #0891b2 55%, #0e7490 100%);
    box-shadow: 0 16px 28px -14px rgba(8, 145, 178, 0.5),
        0 2px 4px -1px rgba(8, 145, 178, 0.16);
`;

const Glow = styled.div`
    position: absolute;
    top: -40px;
    right: -30px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.22),
        rgba(255, 255, 255, 0) 65%
    );
    pointer-events: none;
`;

const Content = styled.div`
    position: relative;
`;

const Skyline: FC = () => (
    <svg
        style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 46,
            opacity: 0.16,
        }}
        viewBox="0 0 390 46"
        fill="none"
        preserveAspectRatio="none"
    >
        <rect x="0" y="18" width="26" height="28" fill="#fff" />
        <rect x="30" y="8" width="20" height="38" fill="#fff" />
        <rect x="54" y="22" width="16" height="24" fill="#fff" />
        <rect x="80" y="4" width="24" height="42" fill="#fff" />
        <rect x="112" y="16" width="18" height="30" fill="#fff" />
        <rect x="140" y="24" width="30" height="22" fill="#fff" />
        <rect x="180" y="0" width="22" height="46" fill="#fff" />
        <rect x="210" y="20" width="16" height="26" fill="#fff" />
        <rect x="234" y="10" width="24" height="36" fill="#fff" />
        <rect x="266" y="24" width="18" height="22" fill="#fff" />
        <rect x="292" y="6" width="22" height="40" fill="#fff" />
        <rect x="322" y="18" width="16" height="28" fill="#fff" />
        <rect x="346" y="12" width="26" height="34" fill="#fff" />
    </svg>
);

const NotificationChip = styled.div`
    ${tw`inline-flex flex-row items-center text-white font-semibold`};
    margin-top: 14px;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.16);
    font-size: 12px;
    span.dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ade80;
        flex-shrink: 0;
    }
`;

const Eyebrow = styled.div`
    ${tw`text-xs text-wth_a70 font-medium`};
    letter-spacing: 1px;
`;

const Title = styled.div`
    ${tw`text-xl font-bold`};
    margin-top: 4px;
`;

const LocationRow = styled.div`
    ${tw`flex flex-row items-center text-wth_a70 text-xs`};
    margin-top: 8px;
    .zaui-icon {
        margin-right: 4px;
        font-size: 14px;
    }
`;

const MetaRow = styled.div`
    ${tw`flex flex-row flex-wrap items-center text-wth_a70 text-xs`};
    margin-top: 8px;
    gap: 6px;
`;

const VerifiedTag = styled.span`
    ${tw`flex flex-row items-center text-white font-medium`};
    svg {
        margin-right: 4px;
        color: #4ade80;
    }
`;

const ViewDetailButton = styled.button`
    ${tw`flex flex-row items-center bg-white text-main font-medium rounded-full`};
    margin-top: 12px;
    padding: 6px 14px;
    font-size: 13px;
    border: none;
    svg {
        margin-left: 4px;
    }
`;

const HomeInfoBanner: FC<HomeInfoBannerProps> = props => {
    const { title, address, house, onViewDetail, unreadCount } = props;

    if (house) {
        return (
            <Wrapper>
                <Glow />
                <Skyline />
                <Content>
                    <Eyebrow>NHÀ SỐ CỦA TÔI</Eyebrow>
                    <Title>{house.address}</Title>
                    <LocationRow>
                        <span>Mã nhà số: {house.code}</span>
                    </LocationRow>
                    <MetaRow>
                        {house.verified ? (
                            <VerifiedTag>
                                <Icon icon="zi-check-circle-solid" size={14} />
                                {house.statusLabel}
                            </VerifiedTag>
                        ) : (
                            <span>{house.statusLabel}</span>
                        )}
                        {house.ownerName && (
                            <>
                                <span>·</span>
                                <span>Chủ sở hữu: {house.ownerName}</span>
                            </>
                        )}
                    </MetaRow>
                    {onViewDetail && (
                        <ViewDetailButton onClick={onViewDetail}>
                            Xem chi tiết
                            <Icon icon="zi-chevron-right" size={14} />
                        </ViewDetailButton>
                    )}
                </Content>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <Glow />
            <Skyline />
            <Content>
                <Eyebrow>CỔNG THÔNG TIN ĐIỆN TỬ</Eyebrow>
                <Title>{title}</Title>
                <LocationRow>
                    <Icon icon="zi-location" />
                    <span>{address}</span>
                </LocationRow>
                {!!unreadCount && unreadCount > 0 && (
                    <NotificationChip>
                        <span className="dot" />
                        {unreadCount} thông báo mới
                    </NotificationChip>
                )}
            </Content>
        </Wrapper>
    );
};

export default HomeInfoBanner;
