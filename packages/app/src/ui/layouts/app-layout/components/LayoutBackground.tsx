import { usePageChainId } from '@/domain/hooks/usePageChainId'
import { cn } from '@/ui/utils/style'
import { CSSProperties } from 'react'

const pageGradients = {
  savings: {
    from: '#11B93E',
    via: '#40DA69',
    to: '#FFFFFF',
  },
  farms: {
    from: '#FA43BD',
    via: '#FFB5B5',
    to: '#FFFFFF',
  },
  borrow: {
    from: '#FF895D',
    via: '#FFE6A4',
    to: '#FFFFFF',
  },
  sparkRewards: {
    from: '#5A3DF5',
    via: '#609AFE',
    to: '#FFFFFF',
  },
  sparkToken: {
    from: '#FA43BD',
    via: '#FFA930',
    to: '#FFFFFF',
  },
}

export function LayoutBackground() {
  const pageInfo = usePageChainId()

  const currentPathGroup = pageInfo.activePathGroup ?? 'savings'

  return (
    <div
      className={cn(
        'fixed top-0 right-0 z-10 aspect-[582/1010] bg-[url("/backgrounds/background-lines.svg")] bg-contain bg-no-repeat',
        'w-[200vw] max-w-[1010px] sm:w-[150vw] md:w-[125vw] lg:w-full',
      )}
    >
      <div
        className={cn(
          'aspect-square w-[70vw] translate-x-[643px] translate-y-[66px] blur-[250px] sm:blur-[384px] md:w-[367px]',
          'bg-gradient-to-r from-[--gradient-from] via-[--gradient-via] to-[--gradient-to] duration-300 ease-out [transition-property:_--gradient-from,_--gradient-via,_--gradient-to]',
        )}
        style={
          {
            '--gradient-from': pageGradients[currentPathGroup].from,
            '--gradient-via': pageGradients[currentPathGroup].via,
            '--gradient-to': pageGradients[currentPathGroup].to,
          } as CSSProperties
        }
      />
    </div>
  )
}
