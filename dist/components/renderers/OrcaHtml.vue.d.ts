/**
 * OrcaHtml - Renders HTML content in a sandboxed iframe
 * Used for interactive content like matplotlib plots, Plotly charts, etc.
 *
 * Security: Uses sandbox="allow-scripts" which allows JavaScript execution
 * but prevents access to parent page cookies, localStorage, and DOM.
 */
type __VLS_Props = {
    content: string;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
