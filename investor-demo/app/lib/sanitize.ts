export function sanitizeRichText(input: string) {
  return input
    .replace(
      /<\/?(?:script|style|iframe|object|embed|form|input|button|svg|math)\b[^>]*>/gi,
      "",
    )
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(?:javascript|data\s*:\s*text\/html)\s*:/gi, "")
    .slice(0, 100_000);
}
