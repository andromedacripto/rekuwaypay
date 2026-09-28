export function RekuwayLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="10" fill="white" />
      <path d="M8 8h12c5.523 0 10 4.477 10 10s-4.477 10-10 10H8V8z" fill="black" />
      <path d="M20 18l12 14H20V18z" fill="black" />
    </svg>
  )
}

export function RekuwayLogoWhite({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 4h14c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4z" fill="white" />
      <path d="M18 16l14 16H18V16z" fill="white" />
    </svg>
  )
}
