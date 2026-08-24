import React, { FC } from "react";
import clsx from "clsx";

export interface SpinnerProps {
    visible?: boolean;
    className?: string;
}

const Spinner: FC<SpinnerProps> = ({ visible = true, className }) => {
    if (!visible) return null;
    return (
        <span
            className={clsx(
                "inline-block h-6 w-6 animate-spin rounded-full border-2 border-ng_20 border-t-main",
                className,
            )}
        />
    );
};

export default Spinner;
