import { ReactNode } from 'react'

interface CategoriesGridProps {
  children: ReactNode
}

export function CategoriesGrid({ children }: CategoriesGridProps) {
  return <div className="my-2 grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
}
