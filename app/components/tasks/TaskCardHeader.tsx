type Props = {
  title: string;
  category: string | null;
  statusLabel: string;
  statusBadgeClass: string;
  statusDotClass: string;
};

export default function TaskCardHeader({ title, category, statusLabel, statusBadgeClass, statusDotClass }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug min-w-0 truncate sm:text-base dark:text-gray-50">{title}</p>
        {category && (
          <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            {category}
          </span>
        )}
      </div>
      <span
        className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium shrink-0 ${statusBadgeClass}`}
      >
        <span className={`size-1 rounded-full ${statusDotClass}`} />
        {statusLabel}
      </span>
    </div>
  );
}
