import type { ContentPart, ButtonData } from "../types";
/**
 * ContentElement - Router component for different content types
 * Automatically renders the appropriate component based on element type
 */
type __VLS_Props = {
    element: ContentPart;
    disabledButton?: boolean;
    visibility?: "all" | "admin";
    isAdmin?: boolean;
    mapboxToken?: string;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "button-click": (button: ButtonData) => any;
    "image-modal": (url: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onButton-click"?: ((button: ButtonData) => any) | undefined;
    "onImage-modal"?: ((url: string) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
