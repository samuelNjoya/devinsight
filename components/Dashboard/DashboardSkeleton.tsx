// components/Dashboard/DashboardSkeleton.tsx

import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <div className="flex gap-6">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
      <Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
      <Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
    </div>
  )
}