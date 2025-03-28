import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { PageLayout } from '@/ui/layouts/PageLayout'

export function SpkStakingSkeleton() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-row items-center gap-3">
          <Skeleton className="h-[60px] w-[190px]" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-8 w-[190px]" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-[380px] w-full md:h-[456px] lg:h-[414px]" />
        <Skeleton className="h-[380px] w-full md:h-[456px] lg:h-[414px]" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-[469px] w-full" />
    </PageLayout>
  )
}
