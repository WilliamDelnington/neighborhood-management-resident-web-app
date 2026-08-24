import { useNavigate as useRouterNavigate } from "react-router-dom";

// zmp-ui's useNavigate wraps react-router-dom's and accepts extra
// Zalo-Mini-App-only transition options ({ animate, direction }) at dozens of
// call sites across the app. This wrapper keeps that call signature working
// in a plain browser by accepting and ignoring those options, while passing
// replace/state through to the real react-router-dom navigate.
export interface NavigateOptions {
    animate?: boolean;
    direction?: "forward" | "backward" | "back";
    replace?: boolean;
    state?: unknown;
}

export type NavigateFunction = {
    (to: string, options?: NavigateOptions): void;
    (delta: number): void;
};

export default function useNavigate(): NavigateFunction {
    const navigate = useRouterNavigate();

    return ((to: string | number, options?: NavigateOptions) => {
        if (typeof to === "number") {
            navigate(to);
            return;
        }
        navigate(to, { replace: options?.replace, state: options?.state });
    }) as NavigateFunction;
}
