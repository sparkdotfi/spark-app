import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets, getTokenColor, getTokenImage } from '@/ui/assets'
import { Link } from '@/ui/atoms/link/Link'
import { Tooltip, TooltipContent, TooltipContentLayout, TooltipTrigger } from '@/ui/atoms/tooltip/Tooltip'
import { links } from '@/ui/constants/links'
import { text } from '@/ui/constants/text'

interface AirdropBadgeProps {
  'data-testid'?: string
}

export function AirdropBadge({ 'data-testid': dataTestId }: AirdropBadgeProps) {
  const spk = TokenSymbol('SPK')
  const spkColor = getTokenColor(spk)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="rounded-xxs border p-[3px] outline-none"
          style={{ borderColor: spkColor }}
          data-testid={dataTestId}
        >
          <img src={getTokenImage(spk)} alt={spk} className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent variant="long">
        <TooltipContentLayout>
          <TooltipContentLayout.Header>
            <TooltipContentLayout.Icon src={assets.sparkIcon} />
            <TooltipContentLayout.Title>Eligible for Spark Airdrop</TooltipContentLayout.Title>
          </TooltipContentLayout.Header>

          <TooltipContentLayout.Body>
            {text.airdrop.preFarmingEligibilityMessage} Please read the details on the{' '}
            <Link to={links.docs.sparkAirdrop} external>
              Spark Docs
            </Link>
            .
          </TooltipContentLayout.Body>
        </TooltipContentLayout>
      </TooltipContent>
    </Tooltip>
  )
}
