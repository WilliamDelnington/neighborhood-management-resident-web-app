import React from "react";

const HeadsetIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <path d="M4 14v-2a8 8 0 0116 0v2" />
        <rect x="2.5" y="14" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="14" width="4" height="6" rx="1.5" />
        <path d="M19.5 20v0.5a2.5 2.5 0 01-2.5 2.5h-2" />
    </svg>
);

export default HeadsetIcon;
