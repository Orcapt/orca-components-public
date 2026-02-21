import "highlight.js/styles/stackoverflow-light.css";
import "katex/dist/katex.min.css";
/**
 * Composable for rendering markdown with KaTeX support
 */
export declare function useMarkdown(): {
    render: (text: string) => string;
};
