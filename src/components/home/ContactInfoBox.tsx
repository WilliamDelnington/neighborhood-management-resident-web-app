import React, { FC } from "react";
import { Icon, useNavigate } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";

export interface ContactInfoBoxProps {
    title: string;
    description: string;
}

const Wrapper = styled.div`
    ${tw`flex flex-row items-center bg-white border border-devider_1 rounded-2xl shadow-card`};
    margin: 12px 16px 16px;
    padding: 14px 16px;
`;

const IconCircle = styled.div`
    ${tw`flex items-center justify-center rounded-full bg-primary-50 text-primary-600`};
    width: 40px;
    height: 40px;
    margin-right: 12px;
    flex-shrink: 0;
`;

const Title = styled.div`
    ${tw`text-text_1 font-semibold text-sm`};
`;

const Description = styled.div`
    ${tw`text-text_2 text-xs`};
    margin-top: 4px;
`;

const ContactInfoBox: FC<ContactInfoBoxProps> = props => {
    const { title, description } = props;
    const navigate = useNavigate();

    return (
        <Wrapper onClick={() => navigate("/emergency", { animate: true })}>
            <IconCircle>
                <Icon icon="zi-user" size={18} />
            </IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
                <Title>{title}</Title>
                <Description>{description}</Description>
            </div>
            <Icon icon="zi-chevron-right" size={16} className="text-text_3" />
        </Wrapper>
    );
};

export default ContactInfoBox;
