import { Button } from '@/ui/atoms/button/Button'
import { Link } from '@/ui/atoms/link/Link'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'
import Cookie from './cookie.svg?react'

export interface CookieBannerProps {
  onAccept: () => void
  onDecline: () => void
  className?: string
}

export function CookieBanner({ onAccept, onDecline, className }: CookieBannerProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-sm border border-primary bg-primary p-4 shadow-2xl sm:max-w-[335px]',
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-4">
        <div className="bg-gradient-spark-primary-1 bg-clip-text text-transparent">
          <Cookie className="icon-md" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="typography-label-3 text-primary">Cookies Policy</div>
          <div className="typography-label-4 text-secondary">
            We use cookies to ensure that we give you the best experience on our app. To learn more, visit our{' '}
            <Link to={links.privacyPolicy} variant="primary" external>
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="primary" size="s" onClick={onAccept}>
          Accept
        </Button>
        <Button variant="secondary" size="s" onClick={onDecline}>
          Decline
        </Button>
      </div>
    </div>
  )
}
