import type { SVGProps } from 'react'

const paths = {
  arrow: 'M7 17 17 7M7 7h10v10',
  down: 'M12 4v16m-6-6 6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  mail: 'M4 5h16v14H4zM4 6l8 7 8-7',
  copy: 'M9 9h11v11H9zM15 9V4H4v11h5',
  check: 'm5 12 4 4L19 6',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18',
  shield: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  pause: 'M8 5v14M16 5v14',
  play: 'm8 5 11 7-11 7Z',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
} as const

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
