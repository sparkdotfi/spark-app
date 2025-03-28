import { withSuspense } from '@/ui/utils/withSuspense'

import { SpkStakingSkeleton } from './components/skeleton/SpkStakingSkeleton'
import { useSpkStaking } from './logic/useSpkStaking'
import { SpkStakingView } from './views/SpkStakingView'

function SpkStakingContainer() {
  const spkStaking = useSpkStaking()

  return <SpkStakingView {...spkStaking} />
}

const SpkStakingContainerWithSuspense = withSuspense(SpkStakingContainer, SpkStakingSkeleton)
export { SpkStakingContainerWithSuspense as SpkStakingContainer }
