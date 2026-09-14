export function convertSnakeToReadable(text: string): string {
  if (!text) return "";

  return text
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
