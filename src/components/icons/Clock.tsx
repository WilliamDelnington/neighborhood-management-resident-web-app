import React from "react";

const ClockIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
    </svg>
);

export default ClockIcon;
