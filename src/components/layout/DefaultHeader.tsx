import React, { FC } from "react";
import { Header, Icon } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import Background from "@assets/header-background.png";

export interface DefaultHeaderProps {
    title?: string;
    back?: boolean;
    onBackClick?: (event: React.SyntheticEvent) => void;
}

const HeaderContainer = styled(Header)`
    ${tw`flex flex-row items-center bg-main fixed top-0 left-0 w-full text-white px-4 h-[calc(48px + var(--zaui-safe-area-inset-top, 0px))]`};
    z-index: 1;
    background: linear-gradient(
            0deg,
            rgba(37, 99, 235, 0.92),
            rgba(37, 99, 235, 0.92)
        ),
        url(${Background});
    background-size: cover;
    background-position: center;
    .zaui-btn-icon {
        ${tw`text-white`}
    }
    .zaui-header-back-btn:active {
        background-color: transparent;
    }
    &:after {
        display: none;
    }
    .zaui-header-title {
        padding-right: 98px;
    }
`;

const DefaultHeader: FC<DefaultHeaderProps> = props => {
    const { title, back, onBackClick } = props;

    return (
        <HeaderContainer
            title={title}
            backIcon={<Icon icon="zi-arrow-left" />}
            showBackIcon={back}
            onBackClick={onBackClick}
        />
    );
};

export default DefaultHeader;
