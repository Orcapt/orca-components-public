/**
 * Orca Components Type Definitions
 */
export interface OrcaMarkdownProps {
    /** محتوای اصلی با Orca markers */
    description: string;
    /** نقش فرستنده پیام */
    role: "user" | "assistant" | string;
    /** تصاویر اضافی */
    images?: Record<string, any>;
    /** فایل‌های ضمیمه شده */
    fileAttachments?: string[];
    /** آیا این آخرین پیام است؟ */
    isLastMessage?: boolean;
    /** شناسه store برای مدیریت پیام‌ها */
    storeIdentifier?: string;
    /** سطح دسترسی نمایش */
    visibility?: "all" | "admin" | string;
}
export interface OrcaMarkdownEmits {
    /** رویداد ارسال پیام */
    (e: "send-message", data: SendMessageData): void;
}
export interface SendMessageData {
    /** محتوای پیام */
    message: string;
    /** اطلاعات دکمه (در صورت کلیک روی دکمه) */
    buttonData?: ButtonData;
    /** نوع پیام */
    type?: "text" | "button-action" | "button-link";
}
export interface ButtonData {
    type: "action" | "link";
    label: string;
    id?: number;
    color?: string;
    row?: number;
    url?: string;
}
export interface CardData {
    photo: string;
    header: string;
    subheader: string;
    text?: string;
}
export interface LocationData {
    latitude: number;
    longitude: number;
}
export interface AudioData {
    label: string;
    url: string;
    type: string;
}
export interface TracingData {
    visibility: "all" | "admin";
    content: string;
    rawContent?: string;
}
export type ContentPartType = "text" | "image" | "video" | "youtube" | "card" | "location" | "buttons" | "audio" | "tracing" | "html" | "general-loading" | "thinking-loading" | "searching-loading" | "coding-loading" | "analyzing-loading" | "generating-loading" | "custom-loading" | "image-loading" | "video-loading" | "youtube-loading" | "card-loading" | "map-loading" | "html-loading";
export type TextContentPart = {
    type: "text";
    content: string;
};
export type ImageContentPart = {
    type: "image";
    content: string;
};
export type VideoContentPart = {
    type: "video";
    content: string;
};
export type YoutubeContentPart = {
    type: "youtube";
    content: string;
};
export type CardContentPart = {
    type: "card";
    content: CardData[];
};
export type LocationContentPart = {
    type: "location";
    content: LocationData;
};
export type ButtonsContentPart = {
    type: "buttons";
    content: ButtonData[];
};
export type AudioContentPart = {
    type: "audio";
    content: AudioData[];
};
export type TracingContentPart = {
    type: "tracing";
    content: TracingData;
};
export type HtmlContentPart = {
    type: "html";
    content: string;
};
export type LoadingContentPart = {
    type: "general-loading" | "thinking-loading" | "searching-loading" | "coding-loading" | "analyzing-loading" | "generating-loading" | "custom-loading" | "image-loading" | "video-loading" | "youtube-loading" | "card-loading" | "map-loading" | "html-loading";
    content: string;
};
export type ContentPart = TextContentPart | ImageContentPart | VideoContentPart | YoutubeContentPart | CardContentPart | LocationContentPart | ButtonsContentPart | AudioContentPart | TracingContentPart | HtmlContentPart | LoadingContentPart;
/**
 * Helper function types
 */
export type IsImageFileFn = (url: string) => boolean;
export type GetFileNameFromUrlFn = (url: string) => string | null;
export type GetYouTubeIdFn = (url: string) => string;
/**
 * Mapbox configuration
 */
export interface MapboxConfig {
    accessToken: string;
    style?: string;
    zoom?: number;
}
/**
 * Video player options
 */
export interface VideoPlayerOptions {
    autoplay?: boolean;
    controls?: boolean;
    responsive?: boolean;
    fluid?: boolean;
    sources: Array<{
        type: string;
        src: string;
    }>;
}
