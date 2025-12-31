import { computed, unref, ref, watch, onMounted, nextTick, defineComponent, createElementBlock, openBlock, createElementVNode, createStaticVNode, createVNode, Fragment, renderList, toDisplayString, createTextVNode, onUnmounted, createBlock, withCtx, createCommentVNode, normalizeStyle, normalizeClass, createSlots, Transition, Teleport, isRef, withModifiers } from "vue";
import { VCard, VImg, VCardItem, VCardTitle, VBtn, VIcon, VExpandTransition, VProgressCircular, VDialog } from "vuetify/components";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItLinkAttributes from "markdown-it-link-attributes";
import markdownItKatex from "markdown-it-katex";
import { VideoPlayer } from "@videojs-player/vue";
import mapboxgl from "mapbox-gl";
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
function cleanOrcaMarkers(text) {
  return text.replace(/\[orca\..*?\]/g, "").trim();
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
function useContentParser(description) {
  return computed(() => {
    const content = unref(description);
    const parts = [];
    let remainingContent = content || "";
    while (remainingContent.length > 0) {
      const matches = findMatches(remainingContent);
      if (matches.length === 0) {
        const cleanText = remainingContent.replace(/\[orca\..*?\]/g, "").trim();
        if (cleanText) {
          parts.push({ type: "text", content: cleanText });
        }
        break;
      }
      const firstMatch = matches.reduce(
        (prev, current) => prev.index < current.index ? prev : current
      );
      const textBefore = remainingContent.substring(0, firstMatch.index);
      const cleanTextBefore = textBefore.replace(/\[orca\..*?\]/g, "").trim();
      if (cleanTextBefore) {
        parts.push({ type: "text", content: cleanTextBefore });
      }
      const matchPayloadRaw = firstMatch.match[1] ?? "";
      const matchPayload = matchPayloadRaw.trim();
      const part = processMatch(firstMatch.type, matchPayload);
      if (part) {
        parts.push(part);
      }
      const matchEnd = firstMatch.index + firstMatch.match[0].length;
      remainingContent = remainingContent.substring(matchEnd);
    }
    return parts;
  });
}
function findMatches(content) {
  const patterns = [
    {
      type: "general-loading",
      regex: /\[orca\.loading\.start\](.*?)\[orca\.loading\.end\]/s
    },
    {
      type: "thinking-loading",
      regex: /\[orca\.loading\.thinking\.start\](.*?)\[orca\.loading\.thinking\.end\]/s
    },
    {
      type: "searching-loading",
      regex: /\[orca\.loading\.searching\.start\](.*?)\[orca\.loading\.searching\.end\]/s
    },
    {
      type: "coding-loading",
      regex: /\[orca\.loading\.coding\.start\](.*?)\[orca\.loading\.coding\.end\]/s
    },
    {
      type: "analyzing-loading",
      regex: /\[orca\.loading\.analyzing\.start\](.*?)\[orca\.loading\.analyzing\.end\]/s
    },
    {
      type: "generating-loading",
      regex: /\[orca\.loading\.generating\.start\](.*?)\[orca\.loading\.generating\.end\]/s
    },
    {
      type: "custom-loading",
      regex: /\[orca\.loading\.custom\.start\](.*?)\[orca\.loading\.custom\.end\]/s
    },
    {
      type: "image-loading",
      regex: /\[orca\.(?:image\.loading|loading\.image)\.start\](.*?)\[orca\.(?:image\.loading|loading\.image)\.end\]/s
    },
    {
      type: "video-loading",
      regex: /\[orca\.loading\.video\.start\](.*?)\[orca\.loading\.video\.end\]/s
    },
    {
      type: "youtube-loading",
      regex: /\[orca\.loading\.youtube\.start\](.*?)\[orca\.loading\.youtube\.end\]/s
    },
    {
      type: "card-loading",
      regex: /\[orca\.loading\.(?:card|card\.list)\.start\](.*?)\[orca\.loading\.(?:card|card\.list)\.end\]/s
    },
    {
      type: "map-loading",
      regex: /\[orca\.loading\.map\.start\](.*?)\[orca\.loading\.map\.end\]/s
    },
    {
      type: "image",
      regex: /\[orca\.image\.start\](.*?)\[orca\.image\.end\]/s
    },
    {
      type: "video",
      regex: /\[orca\.video\.start\](.*?)\[orca\.video\.end\]/s
    },
    {
      type: "youtube",
      regex: /\[orca\.youtube\.start\](.*?)\[orca\.youtube\.end\]/s
    },
    {
      type: "card",
      regex: /\[orca\.list\.card\.start\](.*?)\[orca\.list\.card\.end\]/s
    },
    {
      type: "location",
      regex: /\[orca\.location\.start\](.*?)\[orca\.location\.end\]/s
    },
    {
      type: "buttons",
      regex: /\[orca\.buttons\.start\](.*?)\[orca\.buttons\.end\]/s
    },
    {
      type: "tracing",
      regex: /\[orca\.tracing\.start\](.*?)\[orca\.tracing\.end\]/s
    },
    {
      type: "audio",
      regex: /\[orca\.audio\.start\](.*?)\[orca\.audio\.end\]/s
    }
  ];
  const matches = patterns.map(({ type, regex }) => {
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
function processMatch(type, payload) {
  switch (type) {
    case "general-loading":
    case "thinking-loading":
    case "searching-loading":
    case "coding-loading":
    case "analyzing-loading":
    case "generating-loading":
    case "custom-loading":
    case "image-loading":
    case "video-loading":
    case "youtube-loading":
    case "card-loading":
    case "map-loading":
      return null;
    case "image":
    case "video":
    case "youtube":
      return { type, content: payload };
    case "card":
      return { type, content: parseCardData(payload) };
    case "location":
      return { type, content: parseLocationData(payload) };
    case "buttons":
      return { type, content: parseButtonData(payload) };
    case "tracing":
      return { type, content: parseTracingData(payload) };
    case "audio":
      return { type, content: parseAudioData(payload) };
    default:
      return null;
  }
}
function parseCardData(payload) {
  return payload.split("- ").map((block) => block.trim()).filter((block) => block).map((block) => {
    var _a, _b, _c, _d, _e, _f;
    const photo = ((_b = (_a = block.match(/photo:\s*(.+)/)) == null ? void 0 : _a[1]) == null ? void 0 : _b.trim()) || "";
    const header = ((_d = (_c = block.match(/header:\s*(.+)/)) == null ? void 0 : _c[1]) == null ? void 0 : _d.trim()) || "";
    const subheader = ((_f = (_e = block.match(/subheader:\s*(.+)/)) == null ? void 0 : _e[1]) == null ? void 0 : _f.trim()) || "";
    return { photo, header, subheader };
  });
}
function parseLocationData(payload) {
  const [latitude, longitude] = payload.split(",").map((coord) => coord.trim());
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);
  return {
    latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : 0,
    longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : 0
  };
}
function parseButtonData(payload) {
  return payload.split("- ").map((block) => block.trim()).filter((block) => block).map((block) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const rawType = (_b = (_a = block.match(/type:\s*(\w+)/)) == null ? void 0 : _a[1]) == null ? void 0 : _b.trim();
    const type = rawType === "link" ? "link" : "action";
    const label = ((_d = (_c = block.match(/label:\s*(.+)/)) == null ? void 0 : _c[1]) == null ? void 0 : _d.trim()) || "";
    const url = ((_f = (_e = block.match(/url:\s*(.+)/)) == null ? void 0 : _e[1]) == null ? void 0 : _f.trim()) || "";
    const idMatch = block.match(/id:\s*(\d+)/);
    const id = idMatch ? parseInt(idMatch[1].trim(), 10) : void 0;
    const colorMatch = block.match(/color:\s*([^#\s][^\r\n]*[^\s]|\S+)/);
    const color = colorMatch ? colorMatch[1].trim() : void 0;
    const rowValue = (_h = (_g = block.match(/row:\s*(\d+)/)) == null ? void 0 : _g[1]) == null ? void 0 : _h.trim();
    const row = rowValue ? parseInt(rowValue, 10) : void 0;
    return { type, label, url, id, color, row };
  });
}
function parseTracingData(payload) {
  var _a;
  const visibilityMatch = payload.match(/visibility:\s*(\w+)/);
  const visibility = ((_a = visibilityMatch == null ? void 0 : visibilityMatch[1]) == null ? void 0 : _a.trim()) || "all";
  const contentMatch = payload.match(
    /content:\s*(\[.*\])(?=\s*\[orca\.tracing\.end\]|$)/s
  );
  let content = contentMatch ? contentMatch[1].trim() : payload;
  if (!contentMatch) {
    const fallbackMatch = payload.match(
      /content:\s*([^]*?)(?=\s*\[orca\.tracing\.end\]|$)/s
    );
    content = fallbackMatch ? fallbackMatch[1].trim() : payload;
  }
  return {
    visibility,
    content,
    rawContent: payload
  };
}
function parseAudioData(payload) {
  return payload.split("- ").map((block) => block.trim()).filter((block) => block).map((block) => {
    var _a, _b, _c, _d, _e, _f;
    const label = ((_b = (_a = block.match(/label:\s*(.+)/)) == null ? void 0 : _a[1]) == null ? void 0 : _b.trim()) || "";
    const url = ((_d = (_c = block.match(/url:\s*(.+)/)) == null ? void 0 : _c[1]) == null ? void 0 : _d.trim()) || "";
    const type = ((_f = (_e = block.match(/type:\s*(.+)/)) == null ? void 0 : _e[1]) == null ? void 0 : _f.trim()) || "audio/mpeg";
    return { label, url, type };
  });
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
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
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
  html: false,
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
  const render = (text) => {
    const cleanText = text.replace(/\[orca\..*?\]/g, "").trim();
    return cleanText ? md.render(cleanText) : "";
  };
  return { render };
}
const _hoisted_1$e = { class: "image-container tw-my-4" };
const _hoisted_2$a = { class: "image-wrapper" };
const _hoisted_3$7 = ["src"];
const _sfc_main$e = /* @__PURE__ */ defineComponent({
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
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createElementVNode("div", _hoisted_2$a, [
          createElementVNode("img", {
            src: __props.url,
            alt: "Generated image",
            class: "orca-image",
            loading: "lazy",
            onClick: openModal
          }, null, 8, _hoisted_3$7),
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
const OrcaImage = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-e4f9d4c4"]]);
const _hoisted_1$d = { class: "orca-video-container" };
const _hoisted_2$9 = { class: "video-wrapper" };
const _sfc_main$d = /* @__PURE__ */ defineComponent({
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
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        createElementVNode("div", _hoisted_2$9, [
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
const OrcaVideo = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-7a20a30c"]]);
const _hoisted_1$c = { class: "orca-youtube-container" };
const _hoisted_2$8 = { class: "youtube-wrapper" };
const _hoisted_3$6 = ["src"];
const _sfc_main$c = /* @__PURE__ */ defineComponent({
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
      return openBlock(), createElementBlock("div", _hoisted_1$c, [
        createElementVNode("div", _hoisted_2$8, [
          createElementVNode("iframe", {
            width: "100%",
            height: "100%",
            src: embedUrl.value,
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "",
            class: "youtube-iframe"
          }, null, 8, _hoisted_3$6)
        ])
      ]);
    };
  }
});
const OrcaYouTube = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-9cd52c38"]]);
const _hoisted_1$b = { class: "orca-audio-container" };
const _hoisted_2$7 = { class: "audio-list" };
const _hoisted_3$5 = { class: "audio-content" };
const _hoisted_4$4 = { class: "audio-label" };
const _hoisted_5 = ["type"];
const _hoisted_6 = ["src", "type"];
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "OrcaAudio",
  props: {
    audioItems: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$b, [
        createElementVNode("div", _hoisted_2$7, [
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
              createElementVNode("div", _hoisted_3$5, [
                createElementVNode("p", _hoisted_4$4, toDisplayString(audio.label), 1),
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
const OrcaAudio = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-ade9342b"]]);
const _hoisted_1$a = { class: "orca-location-container" };
const _hoisted_2$6 = { class: "map-wrapper" };
const _hoisted_3$4 = { class: "location-info" };
const _hoisted_4$3 = { class: "location-text" };
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "OrcaLocation",
  props: {
    latitude: {},
    longitude: {},
    mapboxToken: {}
  },
  setup(__props) {
    const props = __props;
    const mapInstance = ref(null);
    const mapLoading = ref(false);
    const onMapContainerReady = (el) => {
      const htmlEl = el && "tagName" in el ? el : null;
      if (!htmlEl) return;
      if (!el) return;
      mapLoading.value = true;
      nextTick(() => {
        try {
          mapboxgl.accessToken = props.mapboxToken || "pk.eyJ1IjoicG91cnlhYnpwIiwiYSI6ImNsZ3Vuanl4YzF2NXkzZW1tcnR0MTlxNXEifQ.I3RdtfiL0ObnXbWVKxW1gQ";
          if (mapInstance.value) {
            mapInstance.value.remove();
            mapInstance.value = null;
          }
          const containerId = `map-${props.latitude}-${props.longitude}`;
          htmlEl.id = containerId;
          const newMap = new mapboxgl.Map({
            container: htmlEl,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [props.longitude, props.latitude],
            zoom: 12,
            attributionControl: false
          });
          mapInstance.value = newMap;
          newMap.on("load", () => {
            new mapboxgl.Marker({
              color: "#0D5FD6"
            }).setLngLat([props.longitude, props.latitude]).addTo(newMap);
            newMap.addControl(new mapboxgl.NavigationControl());
            setTimeout(() => {
              newMap.resize();
            }, 100);
            mapLoading.value = false;
          });
          newMap.on("error", (e) => {
            console.error("Mapbox error:", e);
            mapLoading.value = false;
          });
          newMap.on("render", () => {
            newMap.resize();
          });
        } catch (error) {
          console.error("Error initializing map:", error);
          mapLoading.value = false;
        }
      });
    };
    onUnmounted(() => {
      if (mapInstance.value) {
        mapInstance.value.remove();
        mapInstance.value = null;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$a, [
        createElementVNode("div", _hoisted_2$6, [
          (openBlock(), createElementBlock("div", {
            ref: (el) => onMapContainerReady(el),
            class: "map-container",
            key: `map-${__props.latitude}-${__props.longitude}`
          }))
        ]),
        createElementVNode("div", _hoisted_3$4, [
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
          createElementVNode("span", _hoisted_4$3, toDisplayString(__props.latitude.toFixed(6)) + ", " + toDisplayString(__props.longitude.toFixed(6)), 1)
        ])
      ]);
    };
  }
});
const OrcaLocation = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-99a42606"]]);
const _hoisted_1$9 = { class: "orca-card-container" };
const _hoisted_2$5 = {
  key: 0,
  class: "card-image-wrapper"
};
const _hoisted_3$3 = {
  key: 1,
  class: "card-subheader"
};
const _hoisted_4$2 = {
  key: 2,
  class: "card-text"
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "OrcaCardList",
  props: {
    cards: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$9, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.cards, (card, i) => {
          return openBlock(), createBlock(unref(VCard), {
            key: i,
            class: "orca-card",
            elevation: "2"
          }, {
            default: withCtx(() => [
              card.photo ? (openBlock(), createElementBlock("div", _hoisted_2$5, [
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
                  card.subheader ? (openBlock(), createElementBlock("span", _hoisted_3$3, toDisplayString(card.subheader), 1)) : createCommentVNode("", true),
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
const OrcaCardList = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-d9e3b93c"]]);
const _hoisted_1$8 = { class: "orca-buttons-container tw-my-4" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
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
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
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
const OrcaButtons = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-480c6090"]]);
const _hoisted_1$7 = {
  key: 0,
  class: "orca-trace-container"
};
const _hoisted_2$4 = { class: "trace-header" };
const _hoisted_3$2 = {
  key: 0,
  class: "trace-content"
};
const _hoisted_4$1 = { class: "trace-pre" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
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
      return shouldShow.value ? (openBlock(), createElementBlock("div", _hoisted_1$7, [
        createVNode(unref(VCard), {
          class: "trace-card",
          elevation: "2"
        }, {
          default: withCtx(() => [
            createElementVNode("div", _hoisted_2$4, [
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
                isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_3$2, [
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
const OrcaTracing = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-69e262d5"]]);
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
        }, null, 8, ["tracing-data", "visibility", "is-admin"])) : createCommentVNode("", true)
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
const GeneralLoading = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-d1c8c108"]]);
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
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          createVNode(GeneralLoading, {
            isLoading: unref(isLoading),
            message: getCurrentLoadingMessage.value
          }, null, 8, ["isLoading", "message"])
        ])),
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
const OrcaMarkdown = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ca820908"]]);
const version = "1.0.1";
const packageInfo = {
  name: "@orcapt/orca-components",
  version: "1.0.1",
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
