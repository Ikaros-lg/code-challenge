const SWITCHEO_ICONS_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

function normalizeTokenSymbol(token: string): string {
  return token.replace(/\s+/g, '')
}

export function getTokenIconUrl(token: string): string {
  const safeSymbol = normalizeTokenSymbol(token)
  return `${SWITCHEO_ICONS_BASE}/${safeSymbol}.svg`
}

/** Fallback data URL when icon fetch fails (no /assets dependency). */
export const TOKEN_ICON_FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="%23482BFF"/><circle cx="12" cy="12" r="10" fill="%23007AFF"/><path d="M12 6v4l3 2-3 2v4l6-5V11l-6-5z" fill="white"/></svg>',
  )
