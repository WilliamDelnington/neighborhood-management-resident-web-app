import React from "react";

const PenIcon: React.FC<{ color?: string; size?: number }> = ({
    color = "currentColor",
    size = 28,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 20l3.5-1 10-10-2.5-2.5-10 10L4 20z" />
        <path d="M14 5l2.5 2.5" />
    </svg>
);

export default PenIcon;
