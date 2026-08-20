import React, { FC } from "react";
import { Icon } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import Background from "@assets/header-background.png";

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
}

const Wrapper = styled.div`
    ${tw`rounded-2xl text-white`};
    margin: 16px;
    padding: 16px;
    background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.95),
            rgba(37, 99, 235, 0.95)
        ),
        url(${Background});
    background-size: cover;
    background-position: center;
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
    const { title, address, house, onViewDetail } = props;

    if (house) {
        return (
            <Wrapper>
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
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <Eyebrow>CỔNG THÔNG TIN ĐIỆN TỬ</Eyebrow>
            <Title>{title}</Title>
            <LocationRow>
                <Icon icon="zi-location" />
                <span>{address}</span>
            </LocationRow>
        </Wrapper>
    );
};

export default HomeInfoBanner;
