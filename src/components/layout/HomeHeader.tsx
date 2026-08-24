import React, { FC, useEffect } from "react";
import { Box, Icon, useNavigate } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import Logo from "@assets/logo.png";
import { useStore } from "@store";

export interface HomeHeaderProps {
    title: string;
}

const HeaderContainer = styled.div`
    ${tw`flex flex-row bg-white text-text_1 items-center justify-between fixed top-0 left-0 w-full px-4`};
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

const BellButton = styled.div`
    ${tw`relative flex items-center justify-center`};
    width: 32px;
    height: 32px;
`;

const UnreadBadge = styled.div`
    ${tw`absolute bg-red-500 rounded-full`};
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
`;

const HomeHeader: FC<HomeHeaderProps> = props => {
    const { title } = props;
    const navigate = useNavigate();
    const unreadCount = useStore(state => state.unreadCount);
    const refreshNotificationStatus = useStore(
        state => state.refreshNotificationStatus,
    );

    useEffect(() => {
        refreshNotificationStatus();
    }, [refreshNotificationStatus]);

    return (
        <HeaderContainer>
            <Box flex alignItems="center">
                <LogoWrapper>
                    <img src={Logo} alt={title} width={32} height={32} />
                </LogoWrapper>
                <Title>{title}</Title>
            </Box>
            <BellButton
                onClick={() => navigate("/notifications", { animate: true })}
            >
                <Icon icon="zi-notif" />
                {unreadCount > 0 && <UnreadBadge />}
            </BellButton>
        </HeaderContainer>
    );
};

export default HomeHeader;
