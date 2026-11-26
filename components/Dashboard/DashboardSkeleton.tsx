// components/DashboardSkeleton.tsx (ou directement dans le même fichier)

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement du tableau de bord">
      {/* En-tête : avatar + infos profil + badge score */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
        <div className="h-12 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Grille de cartes / critères */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Bloc principal (détails / breakdown / liste) */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  )
}