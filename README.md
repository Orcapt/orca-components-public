# 🐋 Orca Components

[![npm version](https://img.shields.io/npm/v/@orcapt/orca-components.svg)](https://www.npmjs.com/package/@orcapt/orca-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Native Vue 3 components for rendering rich content using Orca Markers. Designed for chat applications, messaging systems, and any interface that requires dynamic content rendering with Vuetify.

## ✨ Features

- 🖼️ **Image Display** - With modal zoom and loading states
- 🎬 **Video Playback** - Video.js player and YouTube embed support
- 🎵 **Audio Player** - Customizable audio playback
- 🗺️ **Maps** - Mapbox GL JS integration
- 🎴 **Card Lists** - Display content in beautiful card layouts
- 🔘 **Interactive Buttons** - Action and link buttons with events
- 📝 **Markdown** - Full markdown rendering with syntax highlighting
- ⚡ **Loading States** - Smart loading indicators for all content types
- 🔍 **Tracing** - Debug trace logs display
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- 🎨 **Tailwind CSS** - Built with Tailwind utility classes (prefixed `tw-`)
- 🚀 **Stream Support** - Real-time content streaming compatible

---

## 📦 Installation

### From NPM

```bash
npm install @orcapt/orca-components
# or
yarn add @orcapt/orca-components
# or
pnpm add @orcapt/orca-components
```

**Package:** [@orcapt/orca-components](https://www.npmjs.com/package/@orcapt/orca-components)

---

## 🚀 Quick Start

### 1. Basic Usage

```vue
<script setup lang="ts">
import { OrcaMarkdown } from "@orcapt/orca-components";
import "@orcapt/orca-components/style.css";
import { ref } from "vue";

const message = ref(`
Hello! This is a test message.

[orca.image.start]
https://example.com/image.jpg
[orca.image.end]
`);
</script>

<template>
  <OrcaMarkdown :description="message" role="assistant" :isLastMessage="true" />
</template>
```

### 2. With Event Handling

```vue
<script setup lang="ts">
import { OrcaMarkdown } from "@orcapt/orca-components";
import "@orcapt/orca-components/style.css";

const handleButtonClick = async (data) => {
  console.log("Button clicked:", data);
  // Send to backend or update store
};
</script>

<template>
  <OrcaMarkdown
    v-for="msg in messages"
    :key="msg.id"
    :description="msg.content"
    :role="msg.role"
    :isLastMessage="msg.id === lastMessageId"
    @send-message="handleButtonClick"
  />
</template>
```

---

## 📚 Orca Markers Reference

> **📖 Complete Reference:** See [MARKERS_REFERENCE.md](./MARKERS_REFERENCE.md) for a comprehensive guide to all supported markers.

### 🖼️ Images

```markdown
[orca.image.start]
https://example.com/image.jpg
[orca.image.end]
```

With loading state:

```markdown
[orca.loading.image.start]

[orca.image.start]
https://example.com/image.jpg
[orca.image.end]
```

### 🎬 Videos

**Regular Video:**

```markdown
[orca.video.start]
https://example.com/video.mp4
[orca.video.end]
```

**YouTube:**

```markdown
[orca.youtube.start]
https://www.youtube.com/watch?v=dQw4w9WgXcQ
[orca.youtube.end]
```

**With Loading:**

```markdown
[orca.loading.video.start]

[orca.video.start]
https://example.com/video.mp4
[orca.video.end]
```

### 🗺️ Maps (Location)

```markdown
[orca.location.start]
35.6892, 51.3890
[orca.location.end]
```

### 🔘 Buttons

```yaml
[orca.buttons.start]
- type: action
  label: Option 1
  id: option1
  color: primary
  row: 1
- type: action
  label: Option 2
  id: option2
  color: secondary
  row: 1
- type: link
  label: Visit Website
  url: https://example.com
  color: info
  row: 2
[orca.buttons.end]
```

**Properties:**

- `type`: `action` or `link`
- `color`: Vuetify colors (primary, secondary, error, success, warning, info)
- `row`: Row number for grouping buttons
- `id`: Unique identifier (for action buttons)
- `url`: Link URL (for link buttons)

### 🎴 Card Lists

```yaml
[orca.list.card.start]
- photo: https://example.com/image1.jpg
  header: Card Title 1
  subheader: Card description 1
  text: Additional content for card 1
- photo: https://example.com/image2.jpg
  header: Card Title 2
  subheader: Card description 2
  text: Additional content for card 2
[orca.list.card.end]
```

**With Loading:**

```markdown
[orca.loading.card.start]
```

### 🎵 Audio

```yaml
[orca.audio.start]
- label: Track 1
  url: https://example.com/audio1.mp3
  type: audio/mp3
- label: Track 2
  url: https://example.com/audio2.mp3
  type: audio/mp3
[orca.audio.end]
```

### 🔍 Tracing (Debug)

```yaml
[orca.tracing.start]
visibility: admin
content: {
  "request_id": "req_123456",
  "timestamp": "2024-12-10T12:00:00Z",
  "duration": "245ms",
  "status": "success"
}
[orca.tracing.end]
```

**Visibility Options:**

- `all`: Visible to everyone
- `admin`: Only visible to admins

### ⏳ Loading States

**General Loading:**

```markdown
[orca.loading.start]
```

**Image Loading:**

```markdown
[orca.loading.image.start]
```

**Video Loading:**

```markdown
[orca.loading.video.start]
```

**Card Loading:**

```markdown
[orca.loading.card.start]
```

**Note:** Loading markers don't need an end tag - they're replaced when actual content arrives.

---

## 🎯 Props

```typescript
interface OrcaMarkdownProps {
  /** Content string with Orca markers */
  description: string;

  /** Sender role */
  role: "user" | "assistant";

  /** Additional images */
  images?: Record<string, any>;

  /** Attached files */
  fileAttachments?: string[];

  /** Is this the last message? (enables buttons) */
  isLastMessage?: boolean;

  /** Store identifier for message management */
  storeIdentifier?: string;

  /** Visibility level */
  visibility?: "all" | "admin";

  /** Agent ID */
  agentId?: string;

  /** Message ID */
  messageId?: string;
}
```

---

## 📤 Events

### @send-message

Emitted when user clicks action buttons:

```typescript
interface SendMessageData {
  message: string;
  buttonData?: ButtonData;
  type: "text" | "button-action" | "button-link";
}
```

**Example:**

```vue
<OrcaMarkdown
  :description="message"
  role="assistant"
  @send-message="handleSendMessage"
/>

<script setup>
const handleSendMessage = (data) => {
  console.log("Message:", data.message);
  console.log("Button:", data.buttonData);
  // Send to server or update store
};
</script>
```

---

## 🔧 Advanced Configuration

### Mapbox Token Setup

The component uses a default token, but for production you should use your own:

```typescript
// In your main app file
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";
```

### Custom Styling

```vue
<style scoped>
/* Override default styles */
:deep(.message-content) {
  /* Custom styles */
}

:deep(.image-container img) {
  border-radius: 20px;
}

:deep(.action-button) {
  font-size: 16px;
}
</style>
```

### Tailwind Classes

All Tailwind classes are prefixed with `tw-` to avoid conflicts:

```html
<div class="tw-flex tw-items-center tw-gap-4">
  <!-- Your content -->
</div>
```

---

## 🛠️ Development

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd orca-components-package

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build package
npm run build

# Type check
npm run type-check
```

### Quick Deploy (for local testing)

```bash
# Build, pack, and install in one command
npm run quick-deploy

# Or use the bash script
./dev-deploy.sh
```

See [DEV_GUIDE.md](./DEV_GUIDE.md) for detailed development instructions.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

## 📖 Complete Markers Reference

For a complete reference of all supported Orca markers, see **[MARKERS_REFERENCE.md](./MARKERS_REFERENCE.md)**.

This includes:

- ✅ All loading markers (`orca.loading.*`, `orca.image.loading`, etc.)
- ✅ All content markers (image, video, location, card, buttons, audio, tracing)
- ✅ Complete usage examples
- ✅ Best practices
- ✅ Format specifications

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Bug Reports

To report bugs or request features:

- [GitHub Issues](https://github.com/orca-team/orca-components/issues)

---

## 📄 License

MIT © Orca Team

---

## 🙏 Credits

Built with amazing tools:

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Video.js](https://videojs.com/)
- [Markdown-it](https://github.com/markdown-it/markdown-it)
- [Highlight.js](https://highlightjs.org/)
- [KaTeX](https://katex.org/)

---

**Made with ❤️ by the Orca Team**
