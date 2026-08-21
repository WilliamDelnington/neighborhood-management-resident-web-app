import React, { FC } from "react";
import { Icon, useNavigate } from "@components/ui";
import styled from "styled-components";
import tw from "twin.macro";
import { PhoneIcon } from "@components/icons";

export interface EmergencyHotline {
    key: string;
    label: string;
    phoneNumber: string;
}

export interface EmergencyContactBoxProps {
    hotlines: EmergencyHotline[];
}

const Wrapper = styled.div`
    ${tw`flex flex-row items-center bg-red-50 border border-red-100 rounded-2xl shadow-card`};
    margin: 12px 16px 0;
    padding: 12px 16px;
`;

const IconCircle = styled.div`
    ${tw`flex items-center justify-center rounded-full bg-red-100 text-red-600`};
    width: 40px;
    height: 40px;
    margin-right: 12px;
    flex-shrink: 0;
`;

const Title = styled.div`
    ${tw`text-red-600 font-semibold text-sm`};
`;

const HotlineRow = styled.div`
    ${tw`flex flex-row flex-wrap items-center text-text_2 text-xs`};
    margin-top: 2px;
`;

const HotlineItem = styled.span`
    ${tw`text-red-500 font-medium`};
`;

const Separator = styled.span`
    ${tw`text-text_3`};
    margin: 0 4px;
`;

const EmergencyContactBox: FC<EmergencyContactBoxProps> = props => {
    const { hotlines } = props;
    const navigate = useNavigate();

    const handleCall = (
        event: React.MouseEvent<HTMLSpanElement>,
        phoneNumber: string,
    ) => {
        event.stopPropagation();
        window.location.href = `tel:${phoneNumber}`;
    };

    return (
        <Wrapper onClick={() => navigate("/emergency", { animate: true })}>
            <IconCircle>
                <PhoneIcon />
            </IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
                <Title>Liên hệ khẩn cấp</Title>
                <HotlineRow>
                    {hotlines.map((item, index) => (
                        <React.Fragment key={item.key}>
                            {index > 0 && <Separator>·</Separator>}
                            <HotlineItem
                                onClick={event =>
                                    handleCall(event, item.phoneNumber)
                                }
                            >
                                {item.label} {item.phoneNumber}
                            </HotlineItem>
                        </React.Fragment>
                    ))}
                </HotlineRow>
            </div>
            <Icon icon="zi-chevron-right" size={16} className="text-red-300" />
        </Wrapper>
    );
};

export default EmergencyContactBox;
