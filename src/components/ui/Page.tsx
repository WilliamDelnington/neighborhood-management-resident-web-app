import React, {
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    useEffect,
    useRef,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
    restoreScroll?: boolean;
    restoreScrollOnBack?: boolean;
}

const scrollPositions = new Map<string, number>();

function useMergedRef<T>(...refs: (ForwardedRef<T> | undefined)[]) {
    return (node: T | null) => {
        refs.forEach(ref => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(node);
                return;
            }
            const mutableRef = ref as { current: T | null };
            mutableRef.current = node;
        });
    };
}

const Page = forwardRef<HTMLDivElement, PageProps>((props, ref) => {
    const {
        restoreScroll,
        restoreScrollOnBack = true,
        children,
        ...rest
    } = props;
    const innerRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();
    const navigationType = useNavigationType();
    const mergedRef = useMergedRef(innerRef, ref);

    useEffect(() => {
        const node = innerRef.current;
        if (node && restoreScroll) {
            const shouldRestore = restoreScrollOnBack
                ? navigationType === "POP"
                : true;
            if (shouldRestore) {
                const saved = scrollPositions.get(location.key);
                if (saved) node.scrollTop = saved;
            }
        }
        return () => {
            if (node && restoreScroll) {
                scrollPositions.set(location.key, node.scrollTop);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div {...rest} ref={mergedRef}>
            {children}
        </div>
    );
});
Page.displayName = "Page";

export default Page;
