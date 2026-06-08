'use client'

import dynamic from 'next/dynamic'
import { PageSkeleton } from '@/shared/ui/skeleton.ui'

const SessionLibraryWidget = dynamic(
  () =>
    import(
      '@/features/session-library/widgets/session-library.widget'
    ).then((mod) => mod.SessionLibraryWidget),
  {
    loading: () => <PageSkeleton />,
  }
)

export function MySessionClient() {
  return <SessionLibraryWidget />
}
