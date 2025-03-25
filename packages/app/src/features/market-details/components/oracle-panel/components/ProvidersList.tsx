import { OracleFeedProvider } from '@/config/chain/types'
import { assets } from '@/ui/assets'
import { testIds } from '@/ui/utils/testIds'
import { raise } from '@sparkdotfi/common-universal'

interface ProvidersListProps {
  providers: OracleFeedProvider[]
}

export function ProvidersList({ providers }: ProvidersListProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 border-primary border-t pt-6 sm:gap-6">
      <div className="typography-label-4 my-auto text-secondary">Provided by</div>
      <div
        className="mt-auto flex flex-wrap gap-2 place-self-end sm:gap-4 sm:place-self-auto"
        data-testid={testIds.marketDetails.oraclePanel.providersList}
      >
        {providers.map((provider) => (
          <img
            key={provider}
            src={assets.oracleProviders[provider] ?? raise('Unknown provider')}
            alt={`${provider} logo`}
            className="h-4 sm:h-5"
          />
        ))}
      </div>
    </div>
  )
}
