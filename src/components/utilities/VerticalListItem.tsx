import React, { FunctionComponent } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Icon, List } from "@components/ui";

import { ImageIcon } from "@components/icons";
import { Utinity } from "@dts";
import WithItemClick from "./WithItemClick";

export interface ItemProps extends Utinity {
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

const StyledListItem = styled(List.Item)`
    ${tw`px-0 py-2`}
    .zaui-list-item-content {
        display: flex;
        align-items: center;
    }
    .zaui-list-item-content {
        overflow: hidden;
    }
`;

const IconBadge = styled.div<{ $bg?: string; $color?: string }>`
    ${tw`rounded-2xl flex items-center justify-center flex-shrink-0`};
    width: 44px;
    height: 44px;
    background: ${({ $bg }) => $bg || "#ECFEFF"};
    color: ${({ $color }) => $color || "#0891B2"};
`;

const UtinityItem: FunctionComponent<ItemProps> = props => {
    const {
        icon: IconComp,
        iconSrc,
        color,
        bgColor,
        label,
        path,
        link,
        phoneNumber,
        handleClickUtinity,
    } = props;

    const handleClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        event.preventDefault();
        handleClickUtinity?.(props);
    };

    const actionable = Boolean(path || link || phoneNumber);

    return (
        <StyledListItem
            onClick={handleClick}
            prefix={
                IconComp ? (
                    <IconBadge $bg={bgColor} $color={color}>
                        <IconComp color={color} size={20} />
                    </IconBadge>
                ) : (
                    iconSrc && <ImageIcon src={iconSrc} />
                )
            }
            title={label}
            suffix={
                actionable && (
                    <Icon icon="zi-chevron-right" className="text-text_3" />
                )
            }
        />
    );
};

export default WithItemClick(UtinityItem);
