import {
  TOKEN_ICON_FALLBACK,
  getTokenIconUrl,
} from '@/features/tokens/api/tokenIconsApi'

export type TokenIconProps = {
  token: string
  size?: number
}

export function TokenIcon({ token, size = 28 }: Readonly<TokenIconProps>) {
  return (
    <img
      src={getTokenIconUrl(token)}
      onError={(e) => {
        e.currentTarget.src = TOKEN_ICON_FALLBACK
      }}
      alt={token}
      width={size}
      height={size}
      className="shrink-0 rounded-full"
    />
  )
}
