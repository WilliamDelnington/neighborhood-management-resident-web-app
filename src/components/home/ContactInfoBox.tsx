import React, { FC } from "react";
import { useNavigate } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";

export interface ContactInfoBoxProps {
    title: string;
    description: string;
}

const Wrapper = styled.div`
    ${tw`bg-white rounded-2xl`};
    margin: 8px 16px 16px;
    padding: 16px;
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
            <Title>{title}</Title>
            <Description>{description}</Description>
        </Wrapper>
    );
};

export default ContactInfoBox;
