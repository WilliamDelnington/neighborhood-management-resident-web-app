/* eslint-disable react/no-unused-prop-types */
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Text } from "@components/ui";

import WithItem from "./WithItemClick";

export interface UtinityItemProps {
    label?: string;
    icon?: React.ElementType<any>;
    color?: string;
    bgColor?: string;
    path?: string;
    onClick?: any;
    inDevelopment?: boolean;
    phoneNumber?: string;
    link?: string;
    showBadge?: boolean;
    handleClickUtinity?: ({
        inDevelopment,
        path,
        phoneNumber,
        link,
    }: {
        inDevelopment?: boolean | undefined;
        path?: string | undefined;
        phoneNumber?: string | undefined;
        link?: string | undefined;
    }) => void;
}

const Wrapper = styled.div`
    ${tw`flex flex-col items-center justify-center bg-white rounded-2xl`};
    padding: 16px 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
`;
const IconWrapper = styled.div<{ $bgColor?: string }>`
    ${tw`rounded-full relative`};
    background-color: ${({ $bgColor }) => $bgColor || "#F5F9FC"};
    width: 56px;
    height: 56px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
`;

const CenterIcon = styled.div`
    ${tw`inline-block `};
`;

const Badge = styled.div`
    ${tw`absolute bg-red-500 rounded-full`};
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border: 2px solid #fff;
`;

const Label = styled(Text)`
    ${tw`text-center`};
    margin-top: 8px;
`;

const UtinityItem: FunctionComponent<UtinityItemProps> = props => {
    const {
        icon: Icon,
        label,
        color,
        bgColor,
        showBadge,
        handleClickUtinity,
    } = props;

    const handleClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        event.preventDefault();
        handleClickUtinity?.(props);
    };

    return (
        <Wrapper onClick={handleClick}>
            {Icon && (
                <IconWrapper $bgColor={bgColor}>
                    <CenterIcon>
                        <Icon color={color} />
                    </CenterIcon>
                    {showBadge && <Badge />}
                </IconWrapper>
            )}
            <Label size="xxSmall">{label}</Label>
        </Wrapper>
    );
};

export default WithItem(UtinityItem);
