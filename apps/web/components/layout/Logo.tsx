'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Props {
  className?: string
  onNavigate?: () => void
}

// Logo — light və dark moda görə uyğun şəkil
// nline-01.png (light fon üçün) / nline-02.png (dark fon üçün)
export function Logo({ className, onNavigate }: Props) {
  return (
    <Link href="/" aria-label="Nline Global — Ana səhifə" className={className} onClick={onNavigate}>
      {/* Light mode logosu */}
      <Image
        src="/nline-01.png"
        alt="Nline Global"
        width={100}
        height={100}
        priority
        className="h-[100px] w-auto object-contain dark:hidden"
      />
      {/* Dark mode logosu */}
      <Image
        src="/nline-02.png"
        alt="Nline Global"
        width={100}
        height={100}
        priority
        className="hidden h-[100px] w-auto object-contain dark:block"
      />
    </Link>
  )
}
