/** Skeleton exibido durante a navegação (internet lenta) */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-6" aria-busy="true" aria-label="Carregando">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton mt-4 h-8 w-64 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-3">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
