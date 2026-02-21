/**
 * Orca Components
 * Native components for rendering special content markers
 * @packageDocumentation
 */
import "./styles/tailwind.css";
export { default as OrcaMarkdown } from "./components/OrcaMarkdown.vue";
export type { AudioData, ButtonData, CardData, ContentPart, ContentPartType, GetFileNameFromUrlFn, GetYouTubeIdFn, IsImageFileFn, OrcaMarkdownEmits, OrcaMarkdownProps, LocationData, MapboxConfig, SendMessageData, TracingData, VideoPlayerOptions, } from "./types";
export { cleanOrcaMarkers, generateMapId, getAppendIconStyle, getFileNameFromUrl, getGroupedButtons, getOutlinedButtonStyle, getOutlinedButtonTextStyle, getVuetifyColor, getYouTubeId, hasLoadingMarkers, isImageFile, } from "./utils/helpers";
export declare const version = "1.0.2";
export declare const packageInfo: {
    name: string;
    undefined: undefined;
    description: string;
    author: string;
};
