import type { TracingData } from "../../types";
/**
 * OrcaTracing - Renders tracing/debug log content
 * Displays trace logs with expand/collapse functionality
 */
type __VLS_Props = {
    tracingData: TracingData | TracingData[];
    visibility?: "all" | "admin";
    isAdmin?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
