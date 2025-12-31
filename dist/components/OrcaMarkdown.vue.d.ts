import "highlight.js/styles/stackoverflow-light.css";
import "katex/dist/katex.min.css";
import "../styles/tailwind.css";
import type { OrcaMarkdownProps } from "../types";
declare const __VLS_export: import("vue").DefineComponent<OrcaMarkdownProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "send-message": (data: import("../types").SendMessageData) => any;
}, string, import("vue").PublicProps, Readonly<OrcaMarkdownProps> & Readonly<{
    "onSend-message"?: ((data: import("../types").SendMessageData) => any) | undefined;
}>, {
    visibility: "all" | "admin" | string;
    fileAttachments: string[];
    isLastMessage: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
