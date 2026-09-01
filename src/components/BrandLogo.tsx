import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { ORIGINAL_LOGO_MARK_SRC, ORIGINAL_LOGO_SRC } from '@/lib/logoData'

/** Owner's original logo artwork (transparent) — not a generated substitute. */
export function BrandLogo({
  className,
  markOnly = false,
  to = '/',
}: {
  className?: string
  markOnly?: boolean
  to?: string
}) {
  if (markOnly) {
    return (
      <Link to={to} className={cn('inline-flex shrink-0', className)} aria-label="Big ITunes Collection">
        <img
          src={ORIGINAL_LOGO_MARK_SRC}
          alt=""
          className="h-9 w-9 object-contain"
          width={36}
          height={36}
        />
      </Link>
    )
  }

  return (
    <Link to={to} className={cn('inline-flex shrink-0 items-center', className)} aria-label="Big ITunes Collection">
      <img
        src={ORIGINAL_LOGO_SRC}
        alt="Big ITunes Collection"
        className="h-10 w-auto max-w-[170px] object-contain object-left md:h-12 md:max-w-[200px]"
        width={200}
        height={150}
      />
    </Link>
  )
}
