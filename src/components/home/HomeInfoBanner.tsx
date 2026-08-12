import React, { FC } from "react";
import { Icon } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import Background from "@assets/header-background.png";

export interface HomeInfoBannerProps {
    title: string;
    address: string;
}

const Wrapper = styled.div`
    ${tw`rounded-2xl text-white`};
    margin: 16px;
    padding: 16px;
    background: linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.95),
            rgba(29, 78, 216, 0.95)
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

const HomeInfoBanner: FC<HomeInfoBannerProps> = props => {
    const { title, address } = props;
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
