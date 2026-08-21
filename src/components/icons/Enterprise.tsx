import React from "react";

const EnterpriseIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19c.9-3.3 3.1-5.3 6-5.3s5.1 2 6 5.3" />
        <circle cx="17" cy="9" r="2.3" />
        <path d="M15.3 14.1c2.5.4 4.4 2.3 5.1 4.9" />
    </svg>
);

export default EnterpriseIcon;
