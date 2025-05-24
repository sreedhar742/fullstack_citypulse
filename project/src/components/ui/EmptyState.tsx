import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function EmptyState({
  title,
  description,
  icon = <AlertCircle size={48} />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
