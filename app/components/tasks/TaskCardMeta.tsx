type Props = {
  date: string;
  dueDate: Date | null;
  dueDateStr: string | undefined;
  isOverdue: boolean;
  priorityLabel: string;
  priorityClassName: string;
  priorityDotClass: string;
};

export default function TaskCardMeta({
  date,
  dueDate,
  dueDateStr,
  isOverdue,
  priorityLabel,
  priorityClassName,
  priorityDotClass,
}: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{date}</span>
      {dueDate && (
        <>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
          <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Due {dueDateStr}
          </span>
        </>
      )}
      <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
      <span className={`flex items-center gap-1 text-xs font-medium ${priorityClassName}`}>
        <span className={`size-1.5 rounded-full shrink-0 ${priorityDotClass}`} />
        {priorityLabel}
      </span>
    </div>
  );
}
