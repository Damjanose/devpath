/**
 * Strips markdown formatting to produce plain text suitable for TTS.
 * Removes code blocks, images, links (keeps text), headings markers,
 * bold/italic markers, blockquotes, HTML tags, and horizontal rules.
 */
export function markdownToText(markdown: string): string {
  return (
    markdown
      // Remove fenced code blocks entirely
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]*`/g, "")
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Convert links to just their text
      .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
      // Remove heading markers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic markers (*** ** * ___ __ _)
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
      // Remove blockquote markers
      .replace(/^\s*>\s?/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove list markers (- * + and numbered)
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // Collapse multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
