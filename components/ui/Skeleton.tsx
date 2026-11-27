// components/ui/Skeleton.tsx

interface SkeletonProps {
  className?: string
}

/**
 * Bloc de chargement avec animation shimmer (définie dans globals.css).
 * Déterministe : pas de Date.now(), pas de Math.random().
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer rounded-lg ${className}`} aria-hidden />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}