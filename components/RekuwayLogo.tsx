/* eslint-disable @next/next/no-img-element */
export function RekuwayLogo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Rekuway Pay"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
