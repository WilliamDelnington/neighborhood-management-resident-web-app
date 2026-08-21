import React from "react";

const VoteIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M9 12.5l2 2 4-4" />
    </svg>
);

export default VoteIcon;
