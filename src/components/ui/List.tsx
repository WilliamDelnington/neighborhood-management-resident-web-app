import React, { FC, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
    divider?: boolean;
    noSpacing?: boolean;
}

export interface ListItemProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "prefix"> {
    prefix?: ReactNode;
    suffix?: ReactNode;
    title?: ReactNode;
    subTitle?: ReactNode;
}

const Item: FC<ListItemProps> = ({
    prefix,
    suffix,
    title,
    subTitle,
    className,
    ...rest
}) => (
    <div
        {...rest}
        className={clsx(
            "zaui-list-item-content flex items-center gap-3 px-4 py-3",
            className,
        )}
    >
        {prefix}
        <div className="min-w-0 flex-1">
            {title && (
                <div className="truncate text-[15px] text-text_1">{title}</div>
            )}
            {subTitle && (
                <div className="truncate text-[13px] text-text_2">
                    {subTitle}
                </div>
            )}
        </div>
        {suffix}
    </div>
);
Item.displayName = "List.Item";

const List: FC<ListProps> & { Item: FC<ListItemProps> } = ({
    divider = true,
    noSpacing,
    className,
    children,
    ...rest
}) => (
    <div
        {...rest}
        className={clsx(
            !noSpacing && "space-y-2",
            divider && "divide-y divide-divider_01",
            className,
        )}
    >
        {children}
    </div>
);
List.Item = Item;

export default List;
