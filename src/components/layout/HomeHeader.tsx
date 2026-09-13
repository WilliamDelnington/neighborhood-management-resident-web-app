import React, { FC } from "react";
import { Box } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import Logo from "@assets/logo.png";

export interface HomeHeaderProps {
    title: string;
}

const HeaderContainer = styled.div`
    ${tw`flex flex-row bg-white text-text_1 items-center fixed top-0 left-0 w-full px-4`};
    height: calc(48px + var(--zaui-safe-area-inset-top, 0px));
    padding-top: var(--zaui-safe-area-inset-top, 0px);
    z-index: 1;
    box-shadow: inset 0 -1px 0 0 #e5e7eb;
`;

const LogoWrapper = styled.div`
    ${tw`rounded-lg overflow-hidden`};
    width: 32px;
    height: 32px;
    margin-right: 8px;
    flex-shrink: 0;
`;

const Title = styled.div`
    ${tw`text-base font-semibold`}
`;

const HomeHeader: FC<HomeHeaderProps> = props => {
    const { title } = props;

    return (
        <HeaderContainer>
            <Box flex alignItems="center">
                <LogoWrapper>
                    <img src={Logo} alt={title} width={32} height={32} />
                </LogoWrapper>
                <Title>{title}</Title>
            </Box>
        </HeaderContainer>
    );
};

export default HomeHeader;
