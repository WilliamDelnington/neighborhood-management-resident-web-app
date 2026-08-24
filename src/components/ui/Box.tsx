import React, { forwardRef, CSSProperties, HTMLAttributes } from "react";
import clsx from "clsx";

// zmp-ui's Box spacing scale is calc(n*4px), which is bit-for-bit Tailwind's
// default spacing scale - map spacing props to real Tailwind classes (not a
// template string) so the JIT scanner picks them up.
const SPACE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
type Space = typeof SPACE[number];

const P: Record<Space, string> = {
    0: "p-0",
    1: "p-1",
    2: "p-2",
    3: "p-3",
    4: "p-4",
    5: "p-5",
    6: "p-6",
    7: "p-7",
    8: "p-8",
    9: "p-9",
    10: "p-10",
};
const M: Record<Space, string> = {
    0: "m-0",
    1: "m-1",
    2: "m-2",
    3: "m-3",
    4: "m-4",
    5: "m-5",
    6: "m-6",
    7: "m-7",
    8: "m-8",
    9: "m-9",
    10: "m-10",
};
const PT: Record<Space, string> = {
    0: "pt-0",
    1: "pt-1",
    2: "pt-2",
    3: "pt-3",
    4: "pt-4",
    5: "pt-5",
    6: "pt-6",
    7: "pt-7",
    8: "pt-8",
    9: "pt-9",
    10: "pt-10",
};
const PB: Record<Space, string> = {
    0: "pb-0",
    1: "pb-1",
    2: "pb-2",
    3: "pb-3",
    4: "pb-4",
    5: "pb-5",
    6: "pb-6",
    7: "pb-7",
    8: "pb-8",
    9: "pb-9",
    10: "pb-10",
};
const PL: Record<Space, string> = {
    0: "pl-0",
    1: "pl-1",
    2: "pl-2",
    3: "pl-3",
    4: "pl-4",
    5: "pl-5",
    6: "pl-6",
    7: "pl-7",
    8: "pl-8",
    9: "pl-9",
    10: "pl-10",
};
const PR: Record<Space, string> = {
    0: "pr-0",
    1: "pr-1",
    2: "pr-2",
    3: "pr-3",
    4: "pr-4",
    5: "pr-5",
    6: "pr-6",
    7: "pr-7",
    8: "pr-8",
    9: "pr-9",
    10: "pr-10",
};
const PX: Record<Space, string> = {
    0: "px-0",
    1: "px-1",
    2: "px-2",
    3: "px-3",
    4: "px-4",
    5: "px-5",
    6: "px-6",
    7: "px-7",
    8: "px-8",
    9: "px-9",
    10: "px-10",
};
const PY: Record<Space, string> = {
    0: "py-0",
    1: "py-1",
    2: "py-2",
    3: "py-3",
    4: "py-4",
    5: "py-5",
    6: "py-6",
    7: "py-7",
    8: "py-8",
    9: "py-9",
    10: "py-10",
};
const MT: Record<Space, string> = {
    0: "mt-0",
    1: "mt-1",
    2: "mt-2",
    3: "mt-3",
    4: "mt-4",
    5: "mt-5",
    6: "mt-6",
    7: "mt-7",
    8: "mt-8",
    9: "mt-9",
    10: "mt-10",
};
const MB: Record<Space, string> = {
    0: "mb-0",
    1: "mb-1",
    2: "mb-2",
    3: "mb-3",
    4: "mb-4",
    5: "mb-5",
    6: "mb-6",
    7: "mb-7",
    8: "mb-8",
    9: "mb-9",
    10: "mb-10",
};
const ML: Record<Space, string> = {
    0: "ml-0",
    1: "ml-1",
    2: "ml-2",
    3: "ml-3",
    4: "ml-4",
    5: "ml-5",
    6: "ml-6",
    7: "ml-7",
    8: "ml-8",
    9: "ml-9",
    10: "ml-10",
};
const MR: Record<Space, string> = {
    0: "mr-0",
    1: "mr-1",
    2: "mr-2",
    3: "mr-3",
    4: "mr-4",
    5: "mr-5",
    6: "mr-6",
    7: "mr-7",
    8: "mr-8",
    9: "mr-9",
    10: "mr-10",
};
const MX: Record<Space, string> = {
    0: "mx-0",
    1: "mx-1",
    2: "mx-2",
    3: "mx-3",
    4: "mx-4",
    5: "mx-5",
    6: "mx-6",
    7: "mx-7",
    8: "mx-8",
    9: "mx-9",
    10: "mx-10",
};
const MY: Record<Space, string> = {
    0: "my-0",
    1: "my-1",
    2: "my-2",
    3: "my-3",
    4: "my-4",
    5: "my-5",
    6: "my-6",
    7: "my-7",
    8: "my-8",
    9: "my-9",
    10: "my-10",
};

const FLEX_DIRECTION: Record<string, string> = {
    row: "flex-row",
    column: "flex-col",
    "row-reverse": "flex-row-reverse",
    "column-reverse": "flex-col-reverse",
};
const JUSTIFY: Record<string, string> = {
    "flex-start": "justify-start",
    "flex-end": "justify-end",
    center: "justify-center",
    "space-between": "justify-between",
    "space-around": "justify-around",
    "space-evenly": "justify-evenly",
};
const ALIGN_ITEMS: Record<string, string> = {
    "flex-start": "items-start",
    "flex-end": "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
    center: "items-center",
};
const ALIGN_CONTENT: Record<string, string> = {
    stretch: "content-stretch",
    center: "content-center",
    "flex-start": "content-start",
    "flex-end": "content-end",
    "space-between": "content-between",
    "space-around": "content-around",
    "space-evenly": "content-evenly",
};
const TEXT_ALIGN: Record<string, string> = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
    justify: "text-justify",
};

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
    p?: Space;
    m?: Space;
    pt?: Space;
    pl?: Space;
    pb?: Space;
    pr?: Space;
    px?: Space;
    py?: Space;
    mt?: Space;
    ml?: Space;
    mb?: Space;
    mr?: Space;
    mx?: Space;
    my?: Space;
    noSpace?: boolean;
    inline?: boolean;
    width?: string | number;
    height?: string | number;
    textAlign?: keyof typeof TEXT_ALIGN;
    flex?: boolean;
    flexDirection?: keyof typeof FLEX_DIRECTION;
    flexWrap?: boolean;
    justifyContent?: keyof typeof JUSTIFY;
    alignItems?: keyof typeof ALIGN_ITEMS;
    alignContent?: keyof typeof ALIGN_CONTENT;
}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    const {
        className,
        style,
        p,
        m,
        pt,
        pl,
        pb,
        pr,
        px,
        py,
        mt,
        ml,
        mb,
        mr,
        mx,
        my,
        noSpace,
        inline,
        width,
        height,
        textAlign,
        flex,
        flexDirection,
        flexWrap,
        justifyContent,
        alignItems,
        alignContent,
        ...rest
    } = props;

    const classes = clsx(
        noSpace && "m-0 p-0",
        inline && "inline-block",
        p !== undefined && P[p],
        m !== undefined && M[m],
        pt !== undefined && PT[pt],
        pl !== undefined && PL[pl],
        pb !== undefined && PB[pb],
        pr !== undefined && PR[pr],
        px !== undefined && PX[px],
        py !== undefined && PY[py],
        mt !== undefined && MT[mt],
        ml !== undefined && ML[ml],
        mb !== undefined && MB[mb],
        mr !== undefined && MR[mr],
        mx !== undefined && MX[mx],
        my !== undefined && MY[my],
        textAlign && TEXT_ALIGN[textAlign],
        flex && "flex",
        flexDirection && FLEX_DIRECTION[flexDirection],
        flexWrap === true && "flex-wrap",
        flexWrap === false && "flex-nowrap",
        justifyContent && JUSTIFY[justifyContent],
        alignItems && ALIGN_ITEMS[alignItems],
        alignContent && ALIGN_CONTENT[alignContent],
        className,
    );

    const boxStyle: CSSProperties = { ...style };
    if (width !== undefined) boxStyle.width = width;
    if (height !== undefined) boxStyle.height = height;

    return <div ref={ref} {...rest} style={boxStyle} className={classes} />;
});
Box.displayName = "Box";

export default Box;
