import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { Link } from '@/ui/atoms/link/Link'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'

interface SparkAirdropInfoProps {
  variant: 'deposit' | 'borrow'
  eligibleToken: TokenSymbol
}

export function SparkAirdropInfoPanel({ variant, eligibleToken }: SparkAirdropInfoProps) {
  const participants = variant === 'deposit' ? 'depositors' : 'borrowers'
  return (
    <div
      className={cn(
        'relative isolate col-span-3 mt-3 flex flex-row items-center gap-3.5 overflow-hidden rounded-lg p-[15px]',
        'before:-z-10 before:absolute before:inset-0 before:bg-gradient-spark-primary-1 before:opacity-10',
        'sm:mt-10',
      )}
    >
      <img src={assets.sparkIcon} alt="Spark logo" className="h-[2.75rem]" />
      <div className="flex flex-col gap-1">
        <h4 className="typography-label-1 text-primary">Eligible for Spark Airdrop</h4>
        <p className="typography-label-4 text-secondary">
          {eligibleToken} {participants} will be eligible for a future ⚡&nbsp;SPK airdrop. Please read the details on
          the{' '}
          <Link to={links.docs.sparkAirdrop} external>
            Spark Docs
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
