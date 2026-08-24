import React, { FC, ReactElement } from "react";
import { Button, ButtonProps } from "@components/ui";

const IconButtonWithLabelWrapper: FC<{ children?: React.ReactNode }> = ({
    children,
}) => <div className="flex flex-col items-center">{children}</div>;

export const IconButtonWithLabel: FC<
    {
        icon: ReactElement;
        label: string;
    } & Pick<ButtonProps, "onClick">
> = ({ icon, label, onClick }) => (
    <IconButtonWithLabelWrapper>
        <Button
            icon={icon}
            onClick={onClick}
            variant="tertiary"
            className="bg-blk_a20 font-normal text-white"
        />
        <div className="mt-2 text-base text-white">{label}</div>
    </IconButtonWithLabelWrapper>
);

const AppButton: FC<ButtonProps> = props => <Button {...props} />;

export default AppButton;
