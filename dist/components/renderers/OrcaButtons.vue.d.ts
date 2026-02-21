import type { ButtonData } from "../../types";
/**
 * OrcaButtons - Renders interactive buttons
 * Supports both action buttons (emit events) and link buttons (open URLs)
 */
type __VLS_Props = {
    buttons: ButtonData[];
    disabled?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "button-click": (button: ButtonData) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onButton-click"?: ((button: ButtonData) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
