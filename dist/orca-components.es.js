import { computed, unref, ref, watch, onMounted, nextTick, defineComponent, createElementBlock, openBlock, createElementVNode, createStaticVNode, createVNode, Fragment, renderList, toDisplayString, createTextVNode, createBlock, withCtx, createCommentVNode, normalizeStyle, normalizeClass, createSlots, useCssVars, onUnmounted, Transition, isRef, withModifiers } from "vue";
import { VCard, VImg, VCardItem, VCardTitle, VBtn, VIcon, VExpandTransition, VProgressCircular, VDialog } from "vuetify/components";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItLinkAttributes from "markdown-it-link-attributes";
import markdownItKatex from "markdown-it-katex";
import { VideoPlayer } from "@videojs-player/vue";
import { components } from "vuetify/dist/vuetify-labs.esm.js";
function isImageFile(url) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg"
  ];
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return imageExtensions.some((ext) => pathname.endsWith(ext));
  } catch (e) {
    return false;
  }
}
function getFileNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split("/");
    const encodedFileName = segments.pop() || "";
    return decodeURIComponent(encodedFileName);
  } catch (e) {
    return null;
  }
}
function getYouTubeId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : "";
}
function getVuetifyColor(colorName) {
  if (!colorName) return "#1976D2";
  const colorMap = {
    primary: "#1976D2",
    secondary: "#424242",
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#FB8C00",
    error: "#FF5252",
    accent: "#82B1FF"
  };
  if (colorMap[colorName.toLowerCase()]) {
    return colorMap[colorName.toLowerCase()];
  }
  return colorName;
}
function getGroupedButtons(buttons) {
  const rows = {};
  buttons.forEach((button) => {
    const row = button.row || 1;
    if (!rows[row]) {
      rows[row] = [];
    }
    rows[row].push(button);
  });
  return Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b)).map((row) => rows[parseInt(row)]);
}
function generateMapId(index) {
  return `map-container-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function cleanOrcaMarkers(text2) {
  return text2.replace(/\[orca\..*?\]/g, "").trim();
}
function hasLoadingMarkers(content) {
  return /\[orca\.(?:loading|image\.loading|loading\.image)\.start\]/.test(
    content
  );
}
function getOutlinedButtonStyle(color) {
  if (!color) return {};
  const hexColor = getVuetifyColor(color);
  return {
    border: `1px solid ${hexColor}`,
    color: hexColor,
    "background-color": "transparent"
  };
}
function getOutlinedButtonTextStyle(color) {
  if (!color) return {};
  const hexColor = getVuetifyColor(color);
  return {
    color: hexColor,
    "background-color": "transparent"
  };
}
function getAppendIconStyle(color) {
  if (!color) return {};
  const hexColor = getVuetifyColor(color);
  return {
    color: hexColor,
    fill: hexColor
  };
}
const MARKERS = [
  // Loading markers (general)
  {
    type: "general-loading",
    start: "[orca.loading.start]",
    end: "[orca.loading.end]"
  },
  {
    type: "thinking-loading",
    start: "[orca.loading.thinking.start]",
    end: "[orca.loading.thinking.end]"
  },
  {
    type: "searching-loading",
    start: "[orca.loading.searching.start]",
    end: "[orca.loading.searching.end]"
  },
  {
    type: "coding-loading",
    start: "[orca.loading.coding.start]",
    end: "[orca.loading.coding.end]"
  },
  {
    type: "analyzing-loading",
    start: "[orca.loading.analyzing.start]",
    end: "[orca.loading.analyzing.end]"
  },
  {
    type: "generating-loading",
    start: "[orca.loading.generating.start]",
    end: "[orca.loading.generating.end]"
  },
  {
    type: "custom-loading",
    start: "[orca.loading.custom.start]",
    end: "[orca.loading.custom.end]"
  },
  // Loading markers (content-specific)
  {
    type: "image-loading",
    start: "[orca.loading.image.start]",
    end: "[orca.loading.image.end]"
  },
  {
    type: "video-loading",
    start: "[orca.loading.video.start]",
    end: "[orca.loading.video.end]"
  },
  {
    type: "youtube-loading",
    start: "[orca.loading.youtube.start]",
    end: "[orca.loading.youtube.end]"
  },
  {
    type: "card-loading",
    start: "[orca.loading.card.list.start]",
    end: "[orca.loading.card.list.end]"
  },
  {
    type: "map-loading",
    start: "[orca.loading.map.start]",
    end: "[orca.loading.map.end]"
  },
  {
    type: "html-loading",
    start: "[orca.loading.html.start]",
    end: "[orca.loading.html.end]"
  },
  // Content markers
  { type: "image", start: "[orca.image.start]", end: "[orca.image.end]" },
  { type: "video", start: "[orca.video.start]", end: "[orca.video.end]" },
  {
    type: "youtube",
    start: "[orca.youtube.start]",
    end: "[orca.youtube.end]"
  },
  {
    type: "card",
    start: "[orca.list.card.start]",
    end: "[orca.list.card.end]"
  },
  {
    type: "location",
    start: "[orca.location.start]",
    end: "[orca.location.end]"
  },
  {
    type: "buttons",
    start: "[orca.buttons.start]",
    end: "[orca.buttons.end]"
  },
  {
    type: "tracing",
    start: "[orca.tracing.start]",
    end: "[orca.tracing.end]"
  },
  { type: "audio", start: "[orca.audio.start]", end: "[orca.audio.end]" },
  { type: "html", start: "[orca.html.start]", end: "[orca.html.end]" }
];
const GENERAL_LOADING_TYPES = [
  "general-loading",
  "thinking-loading",
  "searching-loading",
  "coding-loading",
  "analyzing-loading",
  "generating-loading",
  "custom-loading"
];
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function createMarkerPattern(config) {
  const start = escapeRegex(config.start);
  const end = escapeRegex(config.end);
  return new RegExp(`${start}(.*?)${end}`, "s");
}
function generatePatterns(markers) {
  return markers.map((marker) => ({
    type: marker.type,
    regex: createMarkerPattern(marker)
  }));
}
const CONTENT_PATTERNS = generatePatterns(MARKERS);
function filterMarkers(markers, predicate) {
  return markers.filter(predicate);
}
function isLoadingType$2(type) {
  return type.includes("-loading");
}
function isGeneralLoadingType$1(type) {
  return GENERAL_LOADING_TYPES.includes(type);
}
function getGeneralLoadingMarkers(markers) {
  return filterMarkers(markers, (m) => isGeneralLoadingType$1(m.type));
}
function getContentMarkers(markers) {
  return filterMarkers(markers, (m) => !isLoadingType$2(m.type));
}
function removeByPattern(content, pattern, preserveContent) {
  return content.replace(pattern, preserveContent ? "$1" : "");
}
function removeMarkers(content, markers, preserveContent = false) {
  let cleaned = content;
  for (const marker of markers) {
    const pattern = createMarkerPattern(marker);
    cleaned = removeByPattern(cleaned, pattern, preserveContent);
  }
  return cleaned;
}
function removeLoadingMarkers(content, loadingMarkers) {
  return removeMarkers(content, loadingMarkers, true);
}
function removeContentMarkers(content, contentMarkers) {
  return removeMarkers(content, contentMarkers, false);
}
function removeAllMarkers(content, loadingMarkers, contentMarkers) {
  let cleaned = removeLoadingMarkers(content, loadingMarkers);
  cleaned = removeContentMarkers(cleaned, contentMarkers);
  return cleaned;
}
const GENERAL_LOADING_MARKERS = getGeneralLoadingMarkers(MARKERS);
const CONTENT_MARKERS = getContentMarkers(MARKERS);
function removeOnlyLoadingMarkers(content) {
  return removeLoadingMarkers(content, GENERAL_LOADING_MARKERS);
}
function removeCompleteMarkers(content) {
  return removeAllMarkers(content, GENERAL_LOADING_MARKERS, CONTENT_MARKERS);
}
function findMatches(content) {
  const matches = CONTENT_PATTERNS.map(({ type, regex }) => {
    const match = content.match(regex);
    return {
      type,
      match,
      index: match ? content.indexOf(match[0]) : Infinity
    };
  });
  return matches.filter(
    (m) => m.match !== null && m.index !== Infinity
  );
}
function createFieldPattern(fieldName, allFieldNames) {
  const otherFields = allFieldNames.filter((f) => f !== fieldName).map((f) => `${f}:`).join("|");
  const pattern = `${fieldName}:\\s*([\\s\\S]*?)(?=\\s*(?:${otherFields})|$)`;
  return new RegExp(pattern, "m");
}
function extractField(block, fieldName, allFieldNames) {
  const pattern = createFieldPattern(fieldName, allFieldNames);
  const match = block.match(pattern);
  if (!match || !match[1]) {
    return "";
  }
  let value = match[1];
  value = value.replace(/\u200b/g, "");
  const firstLine = value.split("\n")[0];
  return firstLine.trim();
}
function parseYamlList(payload, fields, mapper) {
  const fieldNames = fields.map((f) => f.name);
  const blocks = payload.split("- ").map((block) => block.trim()).filter((block) => block);
  const results = blocks.map((block) => {
    const extracted = {};
    for (const field of fields) {
      const value = extractField(block, field.name, fieldNames);
      if (field.type === "number") {
        const num = parseInt(value, 10);
        extracted[field.name] = Number.isFinite(num) ? num : field.defaultValue !== void 0 ? field.defaultValue : void 0;
      } else {
        extracted[field.name] = value || (field.defaultValue !== void 0 ? field.defaultValue : field.required ? "" : void 0);
      }
    }
    return mapper(extracted);
  });
  return results;
}
const CARD_FIELDS = [
  {
    name: "photo",
    required: true,
    defaultValue: "https://via.placeholder.com/300x200"
  },
  { name: "header", required: true, defaultValue: "Card Title" },
  { name: "subheader", defaultValue: "" }
];
function parseCard(payload) {
  return parseYamlList(payload, CARD_FIELDS, (data) => ({
    photo: data.photo || "",
    header: data.header || "",
    subheader: data.subheader || ""
  }));
}
const BUTTON_FIELDS = [
  { name: "type", required: true, defaultValue: "action" },
  { name: "label", required: true, defaultValue: "Button" },
  { name: "url", defaultValue: void 0 },
  { name: "id", type: "number", defaultValue: void 0 },
  { name: "color", defaultValue: "primary" },
  { name: "row", type: "number", defaultValue: 1 }
];
function parseButton(payload) {
  const result = parseYamlList(payload, BUTTON_FIELDS, (data) => {
    const type = data.type === "link" ? "link" : "action";
    return {
      type,
      label: data.label || "",
      url: data.url,
      id: data.id,
      color: data.color,
      row: data.row
    };
  });
  return result;
}
const AUDIO_FIELDS = [
  { name: "label", required: true, defaultValue: "Audio Track" },
  { name: "url", required: true, defaultValue: "" },
  { name: "type", required: true, defaultValue: "audio/mpeg" }
];
function parseAudio(payload) {
  return parseYamlList(payload, AUDIO_FIELDS, (data) => ({
    label: data.label || "",
    url: data.url || "",
    type: data.type || ""
  }));
}
function parseLocation(payload) {
  const [latitude, longitude] = payload.split(",").map((coord) => coord.trim());
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);
  return {
    latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : 0,
    longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : 0
  };
}
function parseTracing(payload) {
  var _a;
  const visibilityMatch = payload.match(/visibility:\s*(\w+)/);
  const visibility = (visibilityMatch == null ? void 0 : visibilityMatch[1]) || "all";
  const contentMatch = payload.match(/content:\s*([\s\S]*)/);
  const content = ((_a = contentMatch == null ? void 0 : contentMatch[1]) == null ? void 0 : _a.trim()) || payload;
  return {
    visibility,
    content,
    rawContent: payload
  };
}
function isLoadingType$1(type) {
  return type.includes("-loading");
}
const SIMPLE_CONTENT_TYPES = ["image", "video", "youtube", "html"];
const PARSER_MAP = {
  card: parseCard,
  location: parseLocation,
  buttons: parseButton,
  tracing: parseTracing,
  audio: parseAudio
};
function processMatch(type, payload) {
  if (isLoadingType$1(type)) {
    return null;
  }
  if (SIMPLE_CONTENT_TYPES.includes(type)) {
    return { type, content: payload };
  }
  const parser = PARSER_MAP[type];
  if (parser) {
    const content = parser(payload);
    return { type, content };
  }
  return null;
}
function isGeneralLoadingType(type) {
  return GENERAL_LOADING_TYPES.includes(type);
}
function parseContentRecursively(content) {
  const parts = [];
  let remainingContent = content;
  let iteration = 0;
  const maxIterations = 100;
  while (remainingContent.length > 0 && iteration < maxIterations) {
    iteration++;
    const matches = findMatches(remainingContent);
    if (matches.length === 0) {
      const cleanText = removeCompleteMarkers(remainingContent).trim();
      if (cleanText) {
        parts.push({ type: "text", content: cleanText });
      }
      break;
    }
    const firstMatch = matches.reduce(
      (prev, current) => prev.index < current.index ? prev : current
    );
    const shouldSkip = isGeneralLoadingType(firstMatch.type);
    const textBefore = remainingContent.substring(0, firstMatch.index);
    const cleanTextBefore = removeCompleteMarkers(textBefore).trim();
    if (cleanTextBefore) {
      parts.push({ type: "text", content: cleanTextBefore });
    }
    if (!shouldSkip) {
      const matchPayload = (firstMatch.match[1] ?? "").trim();
      const part = processMatch(firstMatch.type, matchPayload);
      if (part) {
        parts.push(part);
      }
    }
    const matchEnd = firstMatch.index + firstMatch.match[0].length;
    remainingContent = remainingContent.substring(matchEnd);
  }
  return parts;
}
function useContentParser(description) {
  return computed(() => {
    const content = unref(description);
    return parseContent(content || "");
  });
}
function stripIncompleteMarkers(content) {
  let result = content;
  for (const marker of MARKERS) {
    const startIdx = result.lastIndexOf(marker.start);
    if (startIdx === -1) continue;
    const afterStart = result.substring(startIdx + marker.start.length);
    if (!afterStart.includes(marker.end)) {
      result = result.substring(0, startIdx);
    }
  }
  return result;
}
function parseContent(content) {
  const parts = [];
  let remainingContent = stripIncompleteMarkers(content);
  let iteration = 0;
  const MAX_ITERATIONS = 100;
  while (remainingContent.length > 0 && iteration < MAX_ITERATIONS) {
    iteration++;
    const matches = findMatches(remainingContent);
    if (matches.length === 0) {
      addCleanTextIfExists(parts, remainingContent);
      break;
    }
    const firstMatch = matches.reduce(
      (prev, current) => prev.index < current.index ? prev : current
    );
    const textBefore = remainingContent.substring(0, firstMatch.index);
    addCleanTextIfExists(parts, textBefore);
    processMatchAndAddParts(parts, firstMatch);
    const matchEnd = firstMatch.index + firstMatch.match[0].length;
    remainingContent = remainingContent.substring(matchEnd);
  }
  return parts;
}
function addCleanTextIfExists(parts, text2) {
  const cleanText = removeCompleteMarkers(text2).trim();
  if (cleanText) {
    parts.push({ type: "text", content: cleanText });
  }
}
function processMatchAndAddParts(parts, match) {
  const matchPayload = (match.match[1] ?? "").trim();
  const isLoadingType2 = match.type.includes("-loading");
  if (isLoadingType2 && !matchPayload) {
    return;
  }
  if (isLoadingType2 && matchPayload) {
    const cleanPayload = removeOnlyLoadingMarkers(matchPayload);
    if (cleanPayload.trim()) {
      const nestedParts = parseContentRecursively(cleanPayload);
      parts.push(...nestedParts);
    }
    return;
  }
  const part = processMatch(match.type, matchPayload);
  if (part) {
    parts.push(part);
  }
}
const LOADING_PATTERNS = {
  general: {
    start: "[orca.loading.start]",
    end: "[orca.loading.end]"
  },
  thinking: {
    start: "[orca.loading.thinking.start]",
    end: "[orca.loading.thinking.end]"
  },
  searching: {
    start: "[orca.loading.searching.start]",
    end: "[orca.loading.searching.end]"
  },
  coding: {
    start: "[orca.loading.coding.start]",
    end: "[orca.loading.coding.end]"
  },
  analyzing: {
    start: "[orca.loading.analyzing.start]",
    end: "[orca.loading.analyzing.end]"
  },
  generating: {
    start: "[orca.loading.generating.start]",
    end: "[orca.loading.generating.end]"
  },
  custom: {
    start: "[orca.loading.custom.start]",
    end: "[orca.loading.custom.end]"
  },
  image: {
    start: "[orca.loading.image.start]",
    end: "[orca.loading.image.end]",
    actual: /\[orca\.image\.start\](.*?)\[orca\.image\.end\]/s
  },
  video: {
    start: "[orca.loading.video.start]",
    end: "[orca.loading.video.end]",
    actual: /\[orca\.video\.start\](.*?)\[orca\.video\.end\]/s
  },
  youtube: {
    start: "[orca.loading.youtube.start]",
    end: "[orca.loading.youtube.end]",
    actual: /\[orca\.youtube\.start\](.*?)\[orca\.youtube\.end\]/s
  },
  card: {
    start: "[orca.loading.card.start]",
    end: "[orca.loading.card.end]",
    actual: /\[orca\.list\.card\.start\](.*?)\[orca\.list\.card\.end\]/s
  },
  map: {
    start: "[orca.loading.map.start]",
    end: "[orca.loading.map.end]",
    actual: /\[orca\.location\.start\](.*?)\[orca\.location\.end\]/s
  }
};
const LOADING_MESSAGES = {
  "general-loading": "⏳ Loading...",
  "thinking-loading": "🤔 Thinking...",
  "searching-loading": "🔍 Searching...",
  "coding-loading": "💻 Coding...",
  "analyzing-loading": "📊 Analyzing...",
  "generating-loading": "✨ Generating...",
  "custom-loading": "⏳ Processing...",
  "image-loading": "🖼️ Loading image...",
  "video-loading": "🎥 Loading video...",
  "youtube-loading": "📺 Loading YouTube video...",
  "card-loading": "🃏 Loading cards...",
  "map-loading": "🗺️ Loading map..."
};
function isActiveLoading(content, startPattern, endPattern) {
  const hasStart = content.includes(startPattern);
  const hasEnd = content.includes(endPattern);
  return hasStart && !hasEnd;
}
function isActiveContentLoading(content, startPattern, endPattern, actualPattern) {
  const hasStart = content.includes(startPattern);
  const hasEnd = content.includes(endPattern);
  const hasActual = actualPattern ? actualPattern.test(content) : false;
  return hasStart && !hasEnd && !hasActual;
}
function useLoadingStates(description) {
  const isLoading = ref(false);
  const isImageLoading = ref(false);
  const isVideoLoading = ref(false);
  const isCardLoading = ref(false);
  const isLocationLoading = ref(false);
  const descriptionValue = computed(() => {
    return unref(description);
  });
  watch(
    descriptionValue,
    (val) => {
      if (!val) {
        isLoading.value = false;
        return;
      }
      const hasActiveLoading = isActiveLoading(
        val,
        LOADING_PATTERNS.general.start,
        LOADING_PATTERNS.general.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.thinking.start,
        LOADING_PATTERNS.thinking.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.searching.start,
        LOADING_PATTERNS.searching.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.coding.start,
        LOADING_PATTERNS.coding.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.analyzing.start,
        LOADING_PATTERNS.analyzing.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.generating.start,
        LOADING_PATTERNS.generating.end
      ) || isActiveLoading(
        val,
        LOADING_PATTERNS.custom.start,
        LOADING_PATTERNS.custom.end
      );
      isLoading.value = hasActiveLoading;
    },
    { immediate: true }
  );
  watch(
    descriptionValue,
    (val) => {
      isImageLoading.value = isActiveContentLoading(
        val,
        LOADING_PATTERNS.image.start,
        LOADING_PATTERNS.image.end,
        LOADING_PATTERNS.image.actual
      );
    },
    { immediate: true }
  );
  watch(
    descriptionValue,
    (val) => {
      const videoLoading = isActiveContentLoading(
        val,
        LOADING_PATTERNS.video.start,
        LOADING_PATTERNS.video.end,
        LOADING_PATTERNS.video.actual
      );
      const youtubeLoading = isActiveContentLoading(
        val,
        LOADING_PATTERNS.youtube.start,
        LOADING_PATTERNS.youtube.end,
        LOADING_PATTERNS.youtube.actual
      );
      isVideoLoading.value = videoLoading || youtubeLoading;
    },
    { immediate: true }
  );
  watch(
    descriptionValue,
    (val) => {
      isCardLoading.value = isActiveContentLoading(
        val,
        LOADING_PATTERNS.card.start,
        LOADING_PATTERNS.card.end,
        LOADING_PATTERNS.card.actual
      );
    },
    { immediate: true }
  );
  watch(
    descriptionValue,
    (val) => {
      isLocationLoading.value = isActiveContentLoading(
        val,
        LOADING_PATTERNS.map.start,
        LOADING_PATTERNS.map.end,
        LOADING_PATTERNS.map.actual
      );
    },
    { immediate: true }
  );
  const getLoadingMessage = (loadingType) => {
    return LOADING_MESSAGES[loadingType] || LOADING_MESSAGES["general-loading"];
  };
  return {
    isLoading,
    isImageLoading,
    isVideoLoading,
    isCardLoading,
    isLocationLoading,
    getLoadingMessage
  };
}
const COPY_ICON = `
  <div class="d-flex align-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6.66675" y="6.66675" width="10" height="10" rx="2" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.3333 6.66659V4.99992C13.3333 4.07944 12.5871 3.33325 11.6666 3.33325H4.99992C4.07944 3.33325 3.33325 4.07944 3.33325 4.99992V11.6666C3.33325 12.5871 4.07944 13.3333 4.99992 13.3333H6.66659" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="color:rgb(var(--v-theme-on-surface)); font-feature-settings: 'liga' off, 'clig' off; font-family: Inter; font-size: 12px; font-style: normal; font-weight: 400; line-height: 24px;">Copy</span>
  </div>
`;
const COPIED_ICON = `
  <div class="d-flex align-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.16663 9.99992L8.33329 14.1666L16.6666 5.83325" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="color: rgb(var(--v-theme-on-surface)); font-feature-settings: 'liga' off, 'clig' off; font-family: Inter; font-size: 12px; font-style: normal; font-weight: 400; line-height: 24px;"> Copied</span>
  </div>
`;
const COLLAPSE_ICON = `
  <div class="d-flex align-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 14.1667L10 11.6667L12.5 14.1667" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.5 5.83325L10 8.33325L12.5 5.83325" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="color: rgb(var(--v-theme-on-surface)); font-feature-settings: 'liga' off, 'clig' off; font-family: Inter; font-size: 12px; font-style: normal; font-weight: 400; line-height: 24px;"> Collapse</span>
  </div>
`;
const EXPAND_ICON = `
  <div class="d-flex align-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 14.1667L10 11.6667L12.5 14.1667" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.5 5.83325L10 8.33325L12.5 5.83325" stroke="rgb(var(--v-theme-on-surface))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="color: rgb(var(--v-theme-on-surface)); font-feature-settings: 'liga' off, 'clig' off; font-family: Inter; font-size: 12px; font-style: normal; font-weight: 400; line-height: 24px;"> Expand</span>
  </div>
`;
async function copyToClipboard(text2, button) {
  try {
    await navigator.clipboard.writeText(text2);
    button.innerHTML = COPIED_ICON;
    setTimeout(() => {
      button.innerHTML = COPY_ICON;
    }, 2e3);
  } catch (error) {
    console.error("Failed to copy code:", error);
  }
}
function toggleCodeBlock(wrapper, button) {
  const isCollapsed = wrapper.classList.contains("collapsed");
  if (isCollapsed) {
    wrapper.classList.remove("collapsed");
    wrapper.style.maxHeight = "";
    wrapper.style.overflow = "";
    button.innerHTML = COLLAPSE_ICON;
  } else {
    wrapper.classList.add("collapsed");
    const height = wrapper.scrollHeight;
    wrapper.style.maxHeight = `${height}px`;
    wrapper.offsetHeight;
    wrapper.style.maxHeight = "0px";
    wrapper.style.overflow = "hidden";
    button.innerHTML = EXPAND_ICON;
  }
}
function attachCodeButtons(block) {
  if (block.closest(".code-container")) return;
  const codeContainer = document.createElement("div");
  codeContainer.className = "code-container";
  const codeWrapper = document.createElement("div");
  codeWrapper.className = "code-wrapper";
  codeWrapper.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
  codeWrapper.style.overflow = "hidden";
  codeWrapper.appendChild(block.cloneNode(true));
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "buttons-container";
  const copyButton = document.createElement("button");
  copyButton.innerHTML = COPY_ICON;
  copyButton.className = "copy-btn";
  copyButton.onclick = () => {
    var _a;
    const code = ((_a = block.querySelector("code")) == null ? void 0 : _a.innerText) || "";
    copyToClipboard(code, copyButton);
  };
  const collapseButton = document.createElement("button");
  collapseButton.innerHTML = COLLAPSE_ICON;
  collapseButton.className = "collapse-btn";
  collapseButton.onclick = () => {
    toggleCodeBlock(codeWrapper, collapseButton);
  };
  buttonsContainer.appendChild(collapseButton);
  buttonsContainer.appendChild(copyButton);
  codeContainer.appendChild(buttonsContainer);
  codeContainer.appendChild(codeWrapper);
  block.replaceWith(codeContainer);
}
function useCodeButtons(containerRef, shouldAddButtons) {
  const addCodeButtons = () => {
    nextTick(() => {
      if (!containerRef.value || !shouldAddButtons()) return;
      const codeBlocks = containerRef.value.querySelectorAll("pre");
      codeBlocks.forEach((block) => {
        attachCodeButtons(block);
      });
    });
  };
  onMounted(() => {
    addCodeButtons();
  });
  return {
    addCodeButtons
  };
}
function useImageModal() {
  const modalVisible = ref(false);
  const currentImage = ref("");
  const openModal = (imageUrl) => {
    currentImage.value = imageUrl;
    modalVisible.value = true;
  };
  const closeModal = () => {
    modalVisible.value = false;
    setTimeout(() => {
      currentImage.value = "";
    }, 300);
  };
  return {
    modalVisible,
    currentImage,
    openModal,
    closeModal
  };
}
const LOADING_CONTENT_TYPES = [
  "general-loading",
  "thinking-loading",
  "searching-loading",
  "coding-loading",
  "analyzing-loading",
  "generating-loading",
  "custom-loading",
  "image-loading",
  "video-loading",
  "youtube-loading",
  "card-loading",
  "map-loading"
];
function isLoadingType(type) {
  return LOADING_CONTENT_TYPES.includes(type);
}
/*! @license DOMPurify 3.3.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.1/LICENSE */
const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object;
let {
  apply,
  construct
} = typeof Reflect !== "undefined" && Reflect;
if (!freeze) {
  freeze = function freeze2(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal2(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply2(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    return func.apply(thisArg, args);
  };
}
if (!construct) {
  construct = function construct2(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function(thisArg) {
    if (thisArg instanceof RegExp) {
      thisArg.lastIndex = 0;
    }
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    return apply(func, thisArg, args);
  };
}
function unconstruct(Func) {
  return function() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return construct(Func, args);
  };
}
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === "string") {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === "object" && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === "function") {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}
const html$1 = freeze(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]);
const svg$1 = freeze(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]);
const svgFilters = freeze(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]);
const svgDisallowed = freeze(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]);
const mathMl$1 = freeze(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]);
const mathMlDisallowed = freeze(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]);
const text = freeze(["#text"]);
const html = freeze(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]);
const svg = freeze(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]);
const mathMl = freeze(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]);
const xml = freeze(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]);
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm);
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm);
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
const ARIA_ATTR = seal(/^aria-[\-\w]+$/);
const IS_ALLOWED_URI = seal(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
var EXPRESSIONS = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR,
  ATTR_WHITESPACE,
  CUSTOM_ELEMENT,
  DATA_ATTR,
  DOCTYPE_NAME,
  ERB_EXPR,
  IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR,
  TMPLIT_EXPR
});
const NODE_TYPE = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
};
const getGlobal = function getGlobal2() {
  return typeof window === "undefined" ? null : window;
};
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") {
    return null;
  }
  let suffix = null;
  const ATTR_NAME = "data-tt-policy-suffix";
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = "dompurify" + (suffix ? "#" + suffix : "");
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html2) {
        return html2;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    console.warn("TrustedTypes policy " + policyName + " could not be created.");
    return null;
  }
};
const _createHooksMap = function _createHooksMap2() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
  const DOMPurify = (root) => createDOMPurify(root);
  DOMPurify.version = "3.3.1";
  DOMPurify.removed = [];
  if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document: document2
  } = window2;
  const originalDocument = document2;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window2.NamedNodeMap || window2.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window2;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
  const remove = lookupGetter(ElementPrototype, "remove");
  const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
  const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
  const getParentNode = lookupGetter(ElementPrototype, "parentNode");
  if (typeof HTMLTemplateElement === "function") {
    const template = document2.createElement("template");
    if (template.content && template.content.ownerDocument) {
      document2 = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = "";
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document2;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: MUSTACHE_EXPR2,
    ERB_EXPR: ERB_EXPR2,
    TMPLIT_EXPR: TMPLIT_EXPR2,
    DATA_ATTR: DATA_ATTR2,
    ARIA_ATTR: ARIA_ATTR2,
    IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA2,
    ATTR_WHITESPACE: ATTR_WHITESPACE2,
    CUSTOM_ELEMENT: CUSTOM_ELEMENT2
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  let FORBID_TAGS = null;
  let FORBID_ATTR = null;
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  let ALLOW_ARIA_ATTR = true;
  let ALLOW_DATA_ATTR = true;
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  let SAFE_FOR_TEMPLATES = false;
  let SAFE_FOR_XML = true;
  let WHOLE_DOCUMENT = false;
  let SET_CONFIG = false;
  let FORCE_BODY = false;
  let RETURN_DOM = false;
  let RETURN_DOM_FRAGMENT = false;
  let RETURN_TRUSTED_TYPE = false;
  let SANITIZE_DOM = true;
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
  let KEEP_CONTENT = true;
  let IN_PLACE = false;
  let USE_PROFILES = {};
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ["audio", "video", "img", "source", "image", "track"]);
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]);
  const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ["mi", "mo", "mn", "ms", "mtext"]);
  let HTML_INTEGRATION_POINTS = addToSet({}, ["annotation-xml"]);
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ["title", "style", "font", "a", "script"]);
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
  const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
  let transformCaseFunc = null;
  let CONFIG = null;
  const formElement = document2.createElement("form");
  const isRegexOrFunction = function isRegexOrFunction2(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  const _parseConfig = function _parseConfig2() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    if (!cfg || typeof cfg !== "object") {
      cfg = {};
    }
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
    ALLOWED_TAGS = objectHasOwnProperty(cfg, "ALLOWED_TAGS") ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, "ALLOWED_ATTR") ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, "ALLOWED_NAMESPACES") ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, "ADD_URI_SAFE_ATTR") ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, "ADD_DATA_URI_TAGS") ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, "FORBID_CONTENTS") ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, "FORBID_TAGS") ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : clone({});
    FORBID_ATTR = objectHasOwnProperty(cfg, "FORBID_ATTR") ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : clone({});
    USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
    RETURN_DOM = cfg.RETURN_DOM || false;
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
    FORCE_BODY = cfg.FORCE_BODY || false;
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
    IN_PLACE = cfg.IN_PLACE || false;
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === "boolean") {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    if (cfg.ADD_TAGS) {
      if (typeof cfg.ADD_TAGS === "function") {
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      } else {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (cfg.ADD_ATTR) {
      if (typeof cfg.ADD_ATTR === "function") {
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      } else {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    if (cfg.ADD_FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }
    if (KEEP_CONTENT) {
      ALLOWED_TAGS["#text"] = true;
    }
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ["html", "head", "body"]);
    }
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ["tbody"]);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      emptyHTML = trustedTypesPolicy.createHTML("");
    } else {
      if (trustedTypesPolicy === void 0) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      if (trustedTypesPolicy !== null && typeof emptyHTML === "string") {
        emptyHTML = trustedTypesPolicy.createHTML("");
      }
    }
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  const _checkValidNamespace = function _checkValidNamespace2(element) {
    let parent = getParentNode(element);
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: "template"
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === "svg";
      }
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === "math";
      }
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
      }
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    return false;
  };
  const _forceRemove = function _forceRemove2(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  const _removeAttribute = function _removeAttribute2(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    if (name === "is") {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {
        }
      } else {
        try {
          element.setAttribute(name, "");
        } catch (_) {
        }
      }
    }
  };
  const _initDocument = function _initDocument2(dirty) {
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = "<remove></remove>" + dirty;
    } else {
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) {
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {
      }
    }
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, "template", null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  const _createNodeIterator = function _createNodeIterator2(root) {
    return createNodeIterator.call(
      root.ownerDocument || root,
      root,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION,
      null
    );
  };
  const _isClobbered = function _isClobbered2(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function");
  };
  const _isNode = function _isNode2(value) {
    return typeof Node === "function" && value instanceof Node;
  };
  function _executeHooks(hooks2, currentNode, data) {
    arrayForEach(hooks2, (hook) => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  const _sanitizeElements = function _sanitizeElements2(currentNode) {
    let content = null;
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    const tagName = transformCaseFunc(currentNode.nodeName);
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w!]/g, currentNode.innerHTML) && regExpTest(/<[/\w!]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    if (!(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName])) {
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
        content = stringReplace(content, expr, " ");
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
    if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) {
      return false;
    }
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR2, lcName)) ;
    else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR2, lcName)) ;
    else if (EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag)) ;
    else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
        // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName, lcTag)) || // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))
      ) ;
      else {
        return false;
      }
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ;
    else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE2, ""))) ;
    else if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) ;
    else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA2, stringReplace(value, ATTR_WHITESPACE2, ""))) ;
    else if (value) {
      return false;
    } else ;
    return true;
  };
  const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
    return tagName !== "annotation-xml" && stringMatch(tagName, CUSTOM_ELEMENT2);
  };
  const _sanitizeAttributes = function _sanitizeAttributes2(currentNode) {
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: "",
      attrValue: "",
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: void 0
    };
    let l = attributes.length;
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === "value" ? initValue : stringTrim(initValue);
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = void 0;
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name")) {
        _removeAttribute(name, currentNode);
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title|textarea)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (lcName === "attributename" && stringMatch(value, "href")) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
          value = stringReplace(value, expr, " ");
        });
      }
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function") {
        if (namespaceURI) ;
        else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case "TrustedHTML": {
              value = trustedTypesPolicy.createHTML(value);
              break;
            }
            case "TrustedScriptURL": {
              value = trustedTypesPolicy.createScriptURL(value);
              break;
            }
          }
        }
      }
      if (value !== initValue) {
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {
          _removeAttribute(name, currentNode);
        }
      }
    }
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  const _sanitizeShadowDOM = function _sanitizeShadowDOM2(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      _sanitizeElements(shadowNode);
      _sanitizeAttributes(shadowNode);
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM2(shadowNode.content);
      }
    }
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  DOMPurify.sanitize = function(dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = "<!-->";
    }
    if (typeof dirty !== "string" && !_isNode(dirty)) {
      if (typeof dirty.toString === "function") {
        dirty = dirty.toString();
        if (typeof dirty !== "string") {
          throw typeErrorCreate("dirty is not a string, aborting");
        }
      } else {
        throw typeErrorCreate("toString is not a function");
      }
    }
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    DOMPurify.removed = [];
    if (typeof dirty === "string") {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
        }
      }
    } else if (dirty instanceof Node) {
      body = _initDocument("<!---->");
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") {
        body = importedNode;
      } else if (importedNode.nodeName === "HTML") {
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf("<") === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      body = _initDocument(dirty);
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
      }
    }
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    while (currentNode = nodeIterator.nextNode()) {
      _sanitizeElements(currentNode);
      _sanitizeAttributes(currentNode);
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    if (IN_PLACE) {
      return dirty;
    }
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
    }
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
        serializedHTML = stringReplace(serializedHTML, expr, " ");
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function(tag, attr, value) {
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== "function") {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function(entryPoint, hookFunction) {
    if (hookFunction !== void 0) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function(entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function() {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();
const escapeCodeHtml = (value) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return value.replace(/[&<>"']/g, (m) => map[m]);
};
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch {
      }
    }
    return `<pre><code class="hljs">${escapeCodeHtml(str)}</code></pre>`;
  }
}).use(markdownItKatex).use(markdownItLinkAttributes, {
  pattern: /^https?:\/\//,
  attrs: {
    target: "_blank",
    rel: "noopener noreferrer"
  }
});
function useMarkdown() {
  const render = (text2) => {
    const cleanText = text2.replace(/\[orca\..*?\]/g, "").trim();
    if (!cleanText) return "";
    const rawHtml = md.render(cleanText);
    return purify.sanitize(rawHtml, {
      ADD_ATTR: ["style"]
    });
  };
  return { render };
}
const _hoisted_1$f = { class: "image-container tw-my-4" };
const _hoisted_2$b = { class: "image-wrapper" };
const _hoisted_3$8 = ["src"];
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "OrcaImage",
  props: {
    url: {}
  },
  emits: ["open-modal"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const openModal = () => {
      emit("open-modal", props.url);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        createElementVNode("div", _hoisted_2$b, [
          createElementVNode("img", {
            src: __props.url,
            alt: "Generated image",
            class: "orca-image",
            loading: "lazy",
            onClick: openModal
          }, null, 8, _hoisted_3$8),
          _cache[0] || (_cache[0] = createStaticVNode('<div class="image-overlay" data-v-e4f9d4c4><div class="zoom-icon" data-v-e4f9d4c4><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-e4f9d4c4><circle cx="11" cy="11" r="8" data-v-e4f9d4c4></circle><path d="m21 21-4.35-4.35" data-v-e4f9d4c4></path><line x1="11" y1="8" x2="11" y2="14" data-v-e4f9d4c4></line><line x1="8" y1="11" x2="14" y2="11" data-v-e4f9d4c4></line></svg></div></div>', 1))
        ])
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const OrcaImage = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-e4f9d4c4"]]);
const _hoisted_1$e = { class: "orca-video-container" };
const _hoisted_2$a = { class: "video-wrapper" };
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "OrcaVideo",
  props: {
    url: {}
  },
  setup(__props) {
    const videoOptions = ref({
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          type: "video/mp4",
          src: ""
        }
      ]
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createElementVNode("div", _hoisted_2$a, [
          createVNode(unref(VideoPlayer), {
            options: {
              ...videoOptions.value,
              sources: [
                {
                  type: "video/mp4",
                  src: __props.url
                }
              ]
            },
            class: "video-player-custom"
          }, null, 8, ["options"])
        ])
      ]);
    };
  }
});
const OrcaVideo = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-7a20a30c"]]);
const _hoisted_1$d = { class: "orca-youtube-container" };
const _hoisted_2$9 = { class: "youtube-wrapper" };
const _hoisted_3$7 = ["src"];
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "OrcaYouTube",
  props: {
    url: {}
  },
  setup(__props) {
    const props = __props;
    const embedUrl = computed(() => {
      const videoId = getYouTubeId(props.url);
      return `https://www.youtube.com/embed/${videoId}`;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        createElementVNode("div", _hoisted_2$9, [
          createElementVNode("iframe", {
            width: "100%",
            height: "100%",
            src: embedUrl.value,
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "",
            class: "youtube-iframe"
          }, null, 8, _hoisted_3$7)
        ])
      ]);
    };
  }
});
const OrcaYouTube = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-9cd52c38"]]);
const _hoisted_1$c = { class: "orca-audio-container" };
const _hoisted_2$8 = { class: "audio-list" };
const _hoisted_3$6 = { class: "audio-content" };
const _hoisted_4$3 = { class: "audio-label" };
const _hoisted_5 = ["type"];
const _hoisted_6 = ["src", "type"];
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "OrcaAudio",
  props: {
    audioItems: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$c, [
        createElementVNode("div", _hoisted_2$8, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.audioItems, (audio, audioIndex) => {
            return openBlock(), createElementBlock("div", {
              key: audioIndex,
              class: "audio-item"
            }, [
              _cache[1] || (_cache[1] = createElementVNode("div", { class: "audio-icon-wrapper" }, [
                createElementVNode("svg", {
                  class: "audio-icon",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createElementVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  })
                ])
              ], -1)),
              createElementVNode("div", _hoisted_3$6, [
                createElementVNode("p", _hoisted_4$3, toDisplayString(audio.label), 1),
                createElementVNode("audio", {
                  controls: "",
                  class: "audio-player",
                  type: audio.type
                }, [
                  createElementVNode("source", {
                    src: audio.url,
                    type: audio.type
                  }, null, 8, _hoisted_6),
                  _cache[0] || (_cache[0] = createTextVNode(" Your browser does not support the audio element. ", -1))
                ], 8, _hoisted_5)
              ])
            ]);
          }), 128))
        ])
      ]);
    };
  }
});
const OrcaAudio = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-ade9342b"]]);
const _hoisted_1$b = { class: "orca-location-container" };
const _hoisted_2$7 = { class: "location-info" };
const _hoisted_3$5 = { class: "location-text" };
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "OrcaLocation",
  props: {
    latitude: {},
    longitude: {},
    mapboxToken: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$b, [
        _cache[1] || (_cache[1] = createStaticVNode('<div class="map-placeholder" data-v-2d752e0f><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" data-v-2d752e0f><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" data-v-2d752e0f></path><circle cx="12" cy="10" r="3" data-v-2d752e0f></circle></svg><span class="placeholder-text" data-v-2d752e0f>Map view temporarily unavailable</span></div>', 1)),
        createElementVNode("div", _hoisted_2$7, [
          _cache[0] || (_cache[0] = createElementVNode("div", { class: "location-icon" }, [
            createElementVNode("svg", {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2"
            }, [
              createElementVNode("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
              createElementVNode("circle", {
                cx: "12",
                cy: "10",
                r: "3"
              })
            ])
          ], -1)),
          createElementVNode("span", _hoisted_3$5, toDisplayString(__props.latitude.toFixed(6)) + ", " + toDisplayString(__props.longitude.toFixed(6)), 1)
        ])
      ]);
    };
  }
});
const OrcaLocation = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-2d752e0f"]]);
const _hoisted_1$a = { class: "orca-card-container" };
const _hoisted_2$6 = {
  key: 0,
  class: "card-image-wrapper"
};
const _hoisted_3$4 = {
  key: 1,
  class: "card-subheader"
};
const _hoisted_4$2 = {
  key: 2,
  class: "card-text"
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "OrcaCardList",
  props: {
    cards: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$a, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.cards, (card, i) => {
          return openBlock(), createBlock(unref(VCard), {
            key: i,
            class: "orca-card",
            elevation: "2"
          }, {
            default: withCtx(() => [
              card.photo ? (openBlock(), createElementBlock("div", _hoisted_2$6, [
                createVNode(unref(VImg), {
                  src: card.photo,
                  height: "223",
                  cover: "",
                  class: "card-image"
                }, null, 8, ["src"])
              ])) : createCommentVNode("", true),
              createVNode(unref(VCardItem), { class: "card-content" }, {
                default: withCtx(() => [
                  card.header ? (openBlock(), createBlock(unref(VCardTitle), {
                    key: 0,
                    class: "card-header"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(card.header), 1)
                    ]),
                    _: 2
                  }, 1024)) : createCommentVNode("", true),
                  card.subheader ? (openBlock(), createElementBlock("span", _hoisted_3$4, toDisplayString(card.subheader), 1)) : createCommentVNode("", true),
                  card.text ? (openBlock(), createElementBlock("p", _hoisted_4$2, toDisplayString(card.text), 1)) : createCommentVNode("", true)
                ]),
                _: 2
              }, 1024)
            ]),
            _: 2
          }, 1024);
        }), 128))
      ]);
    };
  }
});
const OrcaCardList = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-d9e3b93c"]]);
const _hoisted_1$9 = { class: "orca-buttons-container tw-my-4" };
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "OrcaButtons",
  props: {
    buttons: {},
    disabled: { type: Boolean }
  },
  emits: ["button-click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const groupedButtons = computed(() => getGroupedButtons(props.buttons));
    const handleButtonClick = (button) => {
      if (button.type === "action" && !props.disabled) {
        emit("button-click", button);
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$9, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(groupedButtons.value, (row, rowIndex) => {
          return openBlock(), createElementBlock("div", {
            key: rowIndex,
            class: "button-row"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(row, (button, index) => {
              return openBlock(), createBlock(unref(VBtn), {
                disabled: __props.disabled,
                key: index,
                class: normalizeClass(["orca-button", "custom-outlined-button"]),
                style: normalizeStyle(unref(getOutlinedButtonStyle)(button.color)),
                variant: "text",
                rounded: "xl",
                target: button.type === "link" ? "_blank" : void 0,
                href: button.type === "link" ? button.url : void 0,
                onClick: ($event) => handleButtonClick(button)
              }, createSlots({
                default: withCtx(() => [
                  createElementVNode("span", {
                    style: normalizeStyle(unref(getOutlinedButtonTextStyle)(button.color))
                  }, toDisplayString(button.label), 5)
                ]),
                _: 2
              }, [
                button.type === "link" ? {
                  name: "append",
                  fn: withCtx(() => [
                    createVNode(unref(VIcon), {
                      icon: "tabler-external-link",
                      style: normalizeStyle(unref(getAppendIconStyle)(button.color)),
                      size: "small"
                    }, null, 8, ["style"])
                  ]),
                  key: "0"
                } : void 0
              ]), 1032, ["disabled", "style", "target", "href", "onClick"]);
            }), 128))
          ]);
        }), 128))
      ]);
    };
  }
});
const OrcaButtons = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-480c6090"]]);
const _hoisted_1$8 = {
  key: 0,
  class: "orca-trace-container"
};
const _hoisted_2$5 = { class: "trace-header" };
const _hoisted_3$3 = {
  key: 0,
  class: "trace-content"
};
const _hoisted_4$1 = { class: "trace-pre" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "OrcaTracing",
  props: {
    tracingData: {},
    visibility: {},
    isAdmin: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const traceVisible = ref(false);
    const isVisible = computed(() => traceVisible.value);
    const shouldShow = computed(() => {
      if (Array.isArray(props.tracingData)) {
        return props.tracingData.some(
          (item) => item.visibility === "all" || item.visibility === "admin" && props.isAdmin
        );
      }
      return props.tracingData.visibility === "all" || props.tracingData.visibility === "admin" && props.isAdmin;
    });
    const tracingContent = computed(() => {
      if (Array.isArray(props.tracingData)) {
        return props.tracingData.map((item) => item.content || item.rawContent).join("\n\n");
      }
      return props.tracingData.content || props.tracingData.rawContent || "";
    });
    const toggleTrace = () => {
      traceVisible.value = !traceVisible.value;
    };
    return (_ctx, _cache) => {
      return shouldShow.value ? (openBlock(), createElementBlock("div", _hoisted_1$8, [
        createVNode(unref(VCard), {
          class: "trace-card",
          elevation: "2"
        }, {
          default: withCtx(() => [
            createElementVNode("div", _hoisted_2$5, [
              _cache[0] || (_cache[0] = createElementVNode("div", { class: "trace-header-content" }, [
                createElementVNode("div", { class: "trace-icon" }, [
                  createElementVNode("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  }, [
                    createElementVNode("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
                  ])
                ]),
                createElementVNode("strong", { class: "trace-title" }, "Trace Log")
              ], -1)),
              createVNode(unref(VBtn), {
                size: "small",
                variant: "tonal",
                color: "primary",
                class: "trace-toggle-btn",
                onClick: toggleTrace
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(isVisible.value ? "Hide" : "Show"), 1)
                ]),
                _: 1
              })
            ]),
            createVNode(unref(VExpandTransition), null, {
              default: withCtx(() => [
                isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_3$3, [
                  createElementVNode("pre", _hoisted_4$1, toDisplayString(tracingContent.value), 1)
                ])) : createCommentVNode("", true)
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ])) : createCommentVNode("", true);
    };
  }
});
const OrcaTracing = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-69e262d5"]]);
const _hoisted_1$7 = { class: "orca-html-container" };
const _hoisted_2$4 = { class: "html-wrapper" };
const _hoisted_3$2 = ["srcdoc"];
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "OrcaHtml",
  props: {
    content: {}
  },
  setup(__props) {
    useCssVars((_ctx) => ({
      "v22560b2d": iframeHeight.value + "px"
    }));
    const props = __props;
    const iframeRef = ref(null);
    const iframeHeight = ref(400);
    const sanitizeContent = (content) => {
      let sanitized = content.replace(/<\?xml[^?]*\?>/gi, "");
      sanitized = sanitized.replace(/<!DOCTYPE[^>]*>/gi, "");
      return sanitized.trim();
    };
    const wrappedHtml = computed(() => {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: transparent;
      overflow: hidden;
    }
    body {
      padding: 8px;
    }
    /* SVG responsiveness for matplotlib */
    svg {
      max-width: 100%;
      height: auto;
    }
    /* Plotly container responsiveness */
    .plotly-graph-div {
      width: 100% !important;
    }
  </style>
</head>
<body>
  ${sanitizeContent(props.content)}
  <script>
    // Auto-resize iframe based on content
    function sendHeight() {
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      window.parent.postMessage({ type: 'orca-html-resize', height: height + 16 }, '*');
    }
    
    // Initial send
    setTimeout(sendHeight, 100);
    
    // Send on resize
    window.addEventListener('resize', sendHeight);
    
    // Send when images/content loads
    document.addEventListener('DOMContentLoaded', sendHeight);
    window.addEventListener('load', sendHeight);
    
    // Observe DOM changes for dynamic content (like Plotly)
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  <\/script>
</body>
</html>`;
    });
    const handleIframeLoad = () => {
      adjustHeight();
    };
    const adjustHeight = () => {
      if (iframeRef.value) {
        try {
          const doc = iframeRef.value.contentDocument;
          if (doc && doc.body) {
            const height = Math.max(doc.body.scrollHeight, doc.body.offsetHeight);
            if (height > 0) {
              iframeHeight.value = height + 16;
            }
          }
        } catch (e) {
        }
      }
    };
    const handleMessage = (event) => {
      if (event.data && event.data.type === "orca-html-resize") {
        const newHeight = event.data.height;
        if (newHeight && newHeight > 0) {
          iframeHeight.value = Math.min(newHeight, 800);
        }
      }
    };
    onMounted(() => {
      window.addEventListener("message", handleMessage);
    });
    onUnmounted(() => {
      window.removeEventListener("message", handleMessage);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createElementVNode("div", _hoisted_2$4, [
          createElementVNode("iframe", {
            ref_key: "iframeRef",
            ref: iframeRef,
            srcdoc: wrappedHtml.value,
            sandbox: "allow-scripts",
            class: "html-iframe",
            onLoad: handleIframeLoad
          }, null, 40, _hoisted_3$2)
        ])
      ]);
    };
  }
});
const OrcaHtml = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-c4d7eb31"]]);
const _hoisted_1$6 = ["innerHTML"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "ContentElement",
  props: {
    element: {},
    disabledButton: { type: Boolean },
    visibility: {},
    isAdmin: { type: Boolean },
    mapboxToken: {}
  },
  emits: ["image-modal", "button-click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { render: renderText } = useMarkdown();
    const handleImageModal = (url) => {
      emit("image-modal", url);
    };
    const handleButtonClick = (button) => {
      emit("button-click", button);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        __props.element.type === "text" ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "text-content",
          innerHTML: unref(renderText)(__props.element.content)
        }, null, 8, _hoisted_1$6)) : __props.element.type === "image" ? (openBlock(), createBlock(OrcaImage, {
          key: 1,
          url: __props.element.content,
          onOpenModal: handleImageModal
        }, null, 8, ["url"])) : __props.element.type === "video" ? (openBlock(), createBlock(OrcaVideo, {
          key: 2,
          url: __props.element.content
        }, null, 8, ["url"])) : __props.element.type === "youtube" ? (openBlock(), createBlock(OrcaYouTube, {
          key: 3,
          url: __props.element.content
        }, null, 8, ["url"])) : __props.element.type === "audio" ? (openBlock(), createBlock(OrcaAudio, {
          key: 4,
          "audio-items": __props.element.content
        }, null, 8, ["audio-items"])) : __props.element.type === "location" ? (openBlock(), createBlock(OrcaLocation, {
          key: 5,
          latitude: __props.element.content.latitude,
          longitude: __props.element.content.longitude,
          "mapbox-token": __props.mapboxToken
        }, null, 8, ["latitude", "longitude", "mapbox-token"])) : __props.element.type === "card" ? (openBlock(), createBlock(OrcaCardList, {
          key: 6,
          cards: __props.element.content
        }, null, 8, ["cards"])) : __props.element.type === "buttons" ? (openBlock(), createBlock(OrcaButtons, {
          key: 7,
          buttons: __props.element.content,
          disabled: __props.disabledButton,
          onButtonClick: handleButtonClick
        }, null, 8, ["buttons", "disabled"])) : __props.element.type === "tracing" ? (openBlock(), createBlock(OrcaTracing, {
          key: 8,
          "tracing-data": __props.element.content,
          visibility: __props.visibility,
          "is-admin": __props.isAdmin
        }, null, 8, ["tracing-data", "visibility", "is-admin"])) : __props.element.type === "html" ? (openBlock(), createBlock(OrcaHtml, {
          key: 9,
          content: __props.element.content
        }, null, 8, ["content"])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$5 = {
  key: 0,
  class: "general-loading-container"
};
const _hoisted_2$3 = { class: "loading-content" };
const _hoisted_3$1 = { class: "loading-text" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "GeneralLoading",
  props: {
    isLoading: { type: Boolean },
    message: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: "fade",
        mode: "out-in"
      }, {
        default: withCtx(() => [
          __props.isLoading ? (openBlock(), createElementBlock("div", _hoisted_1$5, [
            createElementVNode("div", _hoisted_2$3, [
              createVNode(unref(VProgressCircular), {
                indeterminate: "",
                size: 24,
                width: 3,
                color: "primary",
                class: "loading-spinner"
              }),
              createElementVNode("span", _hoisted_3$1, toDisplayString(__props.message), 1)
            ])
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const GeneralLoading = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-ba70521a"]]);
const _hoisted_1$4 = {
  key: 0,
  class: "image-loading-placeholder"
};
const _hoisted_2$2 = { class: "loading-skeleton-image" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ImageLoading",
  props: {
    isLoading: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: "fade",
        mode: "out-in"
      }, {
        default: withCtx(() => [
          __props.isLoading ? (openBlock(), createElementBlock("div", _hoisted_1$4, [
            createElementVNode("div", _hoisted_2$2, [
              createVNode(unref(VProgressCircular), {
                indeterminate: "",
                size: 48,
                width: 4,
                color: "primary",
                class: "loading-spinner-large"
              }),
              _cache[0] || (_cache[0] = createElementVNode("span", { class: "loading-skeleton-text" }, "🖼️ Loading image...", -1))
            ])
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const ImageLoading = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-39a596d3"]]);
const _hoisted_1$3 = {
  key: 0,
  class: "video-loading-placeholder"
};
const _hoisted_2$1 = { class: "loading-skeleton-video" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "VideoLoading",
  props: {
    isLoading: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: "fade",
        mode: "out-in"
      }, {
        default: withCtx(() => [
          __props.isLoading ? (openBlock(), createElementBlock("div", _hoisted_1$3, [
            createElementVNode("div", _hoisted_2$1, [
              createVNode(unref(VProgressCircular), {
                indeterminate: "",
                size: 48,
                width: 4,
                color: "primary",
                class: "loading-spinner-large"
              }),
              _cache[0] || (_cache[0] = createElementVNode("div", { class: "loading-skeleton-text" }, "🎥 Loading video...", -1))
            ])
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const VideoLoading = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-0889a265"]]);
const _hoisted_1$2 = {
  key: 0,
  class: "card-loading-placeholder"
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CardLoading",
  props: {
    isLoading: { type: Boolean }
  },
  setup(__props) {
    const VSkeletonLoader = components.VSkeletonLoader;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: "fade",
        mode: "out-in"
      }, {
        default: withCtx(() => [
          __props.isLoading ? (openBlock(), createElementBlock("div", _hoisted_1$2, [
            createVNode(unref(VSkeletonLoader), {
              class: "card-skeleton",
              width: "311",
              type: "image, article"
            }),
            _cache[0] || (_cache[0] = createElementVNode("span", { class: "loading-skeleton-text" }, "🃏 Loading cards...", -1))
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const CardLoading = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-2d326b15"]]);
const _hoisted_1$1 = {
  key: 0,
  class: "map-loading-placeholder"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MapLoading",
  props: {
    isLoading: { type: Boolean }
  },
  setup(__props) {
    const VSkeletonLoader = components.VSkeletonLoader;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: "fade",
        mode: "out-in"
      }, {
        default: withCtx(() => [
          __props.isLoading ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
            createVNode(unref(VSkeletonLoader), {
              class: "map-skeleton",
              width: "500",
              height: "300",
              type: "image"
            }),
            _cache[0] || (_cache[0] = createElementVNode("span", { class: "loading-skeleton-text" }, "🗺️ Loading map...", -1))
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const MapLoading = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4bb3095a"]]);
const _hoisted_1 = { class: "message-content" };
const _hoisted_2 = {
  key: 0,
  class: "tw-flex tw-flex-wrap tw-gap-4 tw-mt-4 tw-mb-4"
};
const _hoisted_3 = ["src", "onClick"];
const _hoisted_4 = { class: "modal-content" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "OrcaMarkdown",
  props: {
    description: {},
    role: {},
    images: {},
    fileAttachments: { default: () => [] },
    isLastMessage: { type: Boolean, default: false },
    storeIdentifier: {},
    visibility: { default: "all" }
  },
  emits: ["send-message"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const messageContentRef = ref(null);
    const { modalVisible, currentImage, openModal, closeModal } = useImageModal();
    const contentParts = useContentParser(computed(() => props.description));
    const {
      isLoading,
      isImageLoading,
      isVideoLoading,
      isCardLoading,
      isLocationLoading,
      getLoadingMessage
    } = useLoadingStates(computed(() => props.description));
    const imageFiles = computed(() => {
      return props.fileAttachments.filter((file) => file && isImageFile(file));
    });
    const nonImageFiles = computed(() => {
      return props.fileAttachments.filter((file) => file && !isImageFile(file));
    });
    const disabledButton = computed(() => {
      return props.role !== "assistant" || !props.isLastMessage || isAdminPage();
    });
    const isAdminPage = () => {
      return props.visibility === "admin";
    };
    const getActiveLoadingType = computed(() => {
      const desc = props.description || "";
      if (desc.includes("[orca.loading.thinking.start]") && !desc.includes("[orca.loading.thinking.end]")) {
        return "thinking-loading";
      }
      if (desc.includes("[orca.loading.searching.start]") && !desc.includes("[orca.loading.searching.end]")) {
        return "searching-loading";
      }
      if (desc.includes("[orca.loading.coding.start]") && !desc.includes("[orca.loading.coding.end]")) {
        return "coding-loading";
      }
      if (desc.includes("[orca.loading.analyzing.start]") && !desc.includes("[orca.loading.analyzing.end]")) {
        return "analyzing-loading";
      }
      if (desc.includes("[orca.loading.generating.start]") && !desc.includes("[orca.loading.generating.end]")) {
        return "generating-loading";
      }
      if (desc.includes("[orca.loading.custom.start]") && !desc.includes("[orca.loading.custom.end]")) {
        return "custom-loading";
      }
      if (desc.includes("[orca.loading.start]") && !desc.includes("[orca.loading.end]")) {
        return "general-loading";
      }
      return null;
    });
    const getCurrentLoadingMessage = computed(() => {
      if (isLoading.value) {
        const activeType = getActiveLoadingType.value;
        if (activeType) {
          return getLoadingMessage(activeType);
        }
        return "⏳ Loading...";
      }
      return "⏳ Loading...";
    });
    const { addCodeButtons } = useCodeButtons(
      messageContentRef,
      () => props.role !== "user"
    );
    watch(contentParts, () => {
      addCodeButtons();
    });
    const handleButtonClick = async (button) => {
      if (button.type === "action" && !disabledButton.value) {
        try {
          emit("send-message", {
            message: button.label,
            buttonData: button,
            type: "button-action"
          });
        } catch (error) {
          console.error("Error emitting button click:", error);
        }
      }
    };
    const handleImageModal = (url) => {
      openModal(url);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createElementVNode("div", _hoisted_1, [
          createElementVNode("div", {
            ref_key: "messageContentRef",
            ref: messageContentRef,
            class: "content-wrapper"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(contentParts), (part, index) => {
              return openBlock(), createElementBlock(Fragment, { key: index }, [
                !unref(isLoadingType)(part.type) ? (openBlock(), createBlock(_sfc_main$6, {
                  key: 0,
                  element: part,
                  "disabled-button": disabledButton.value,
                  visibility: props.visibility,
                  "is-admin": isAdminPage(),
                  onImageModal: handleImageModal,
                  onButtonClick: handleButtonClick
                }, null, 8, ["element", "disabled-button", "visibility", "is-admin"])) : createCommentVNode("", true)
              ], 64);
            }), 128)),
            createVNode(GeneralLoading, {
              isLoading: unref(isLoading),
              message: getCurrentLoadingMessage.value
            }, null, 8, ["isLoading", "message"]),
            createVNode(ImageLoading, { isLoading: unref(isImageLoading) }, null, 8, ["isLoading"]),
            createVNode(VideoLoading, { isLoading: unref(isVideoLoading) }, null, 8, ["isLoading"]),
            createVNode(CardLoading, { isLoading: unref(isCardLoading) }, null, 8, ["isLoading"]),
            createVNode(MapLoading, { isLoading: unref(isLocationLoading) }, null, 8, ["isLoading"]),
            props.fileAttachments && props.fileAttachments.length > 0 && props.role === "user" ? (openBlock(), createElementBlock("div", _hoisted_2, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(imageFiles.value, (file) => {
                return openBlock(), createElementBlock("img", {
                  key: file,
                  src: file,
                  class: "tw-w-[300px] lg:tw-w-[303px] tw-h-[300px] lg:tw-h-[303px] tw-object-cover tw-rounded-lg tw-cursor-pointer",
                  onClick: ($event) => unref(openModal)(file)
                }, null, 8, _hoisted_3);
              }), 128)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(nonImageFiles.value, (file) => {
                return openBlock(), createBlock(unref(VBtn), {
                  key: file,
                  class: "text-center text-sm",
                  variant: "tonal",
                  color: "grey-500",
                  href: file,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(getFileNameFromUrl)(file)), 1)
                  ]),
                  _: 2
                }, 1032, ["href"]);
              }), 128))
            ])) : createCommentVNode("", true)
          ], 512)
        ]),
        createVNode(unref(VDialog), {
          modelValue: unref(modalVisible),
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(modalVisible) ? modalVisible.value = $event : null),
          fullscreen: "",
          class: "image-modal",
          scrim: "rgba(0, 0, 0, 0.85)",
          onClick: unref(closeModal),
          transition: "fade-transition"
        }, {
          default: withCtx(() => [
            createElementVNode("div", {
              class: "modal-close-btn",
              onClick: _cache[0] || (_cache[0] = withModifiers(
                //@ts-ignore
                (...args) => unref(closeModal) && unref(closeModal)(...args),
                ["stop"]
              ))
            }, [..._cache[2] || (_cache[2] = [
              createElementVNode("button", {
                class: "close-button",
                "aria-label": "Close image"
              }, [
                createElementVNode("svg", {
                  width: "24",
                  height: "24",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2.5",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [
                  createElementVNode("line", {
                    x1: "18",
                    y1: "6",
                    x2: "6",
                    y2: "18"
                  }),
                  createElementVNode("line", {
                    x1: "6",
                    y1: "6",
                    x2: "18",
                    y2: "18"
                  })
                ])
              ], -1)
            ])]),
            createElementVNode("div", _hoisted_4, [
              createVNode(unref(VImg), {
                src: unref(currentImage),
                class: "modal-image",
                contain: ""
              }, null, 8, ["src"])
            ])
          ]),
          _: 1
        }, 8, ["modelValue", "onClick"])
      ], 64);
    };
  }
});
const OrcaMarkdown = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-619a1855"]]);
const version = "1.0.2";
const packageInfo = {
  name: "@orca-pt/orca-components",
  undefined: void 0,
  description: "Orca native components for rendering special content markers",
  author: "Orca Team"
};
export {
  OrcaMarkdown,
  cleanOrcaMarkers,
  generateMapId,
  getAppendIconStyle,
  getFileNameFromUrl,
  getGroupedButtons,
  getOutlinedButtonStyle,
  getOutlinedButtonTextStyle,
  getVuetifyColor,
  getYouTubeId,
  hasLoadingMarkers,
  isImageFile,
  packageInfo,
  version
};
//# sourceMappingURL=orca-components.es.js.map
