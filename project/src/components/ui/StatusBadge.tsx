import { ComplaintStatus } from "../../types/complaints";
import clsx from "clsx";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
}

function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getBadgeClass = () => {
    const baseClasses = "inline-flex items-center rounded-full font-medium";

    // Size specific classes
    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-base",
    };

    // Status specific classes
    const statusClasses = {
      [ComplaintStatus.PENDING]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      [ComplaintStatus.IN_PROGRESS]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      [ComplaintStatus.RESOLVED]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      [ComplaintStatus.CLOSED]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    };

    return clsx(baseClasses, sizeClasses[size], statusClasses[status]);
  };

  const getStatusText = () => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return "Pending";
      case ComplaintStatus.IN_PROGRESS:
        return "In Progress";
      case ComplaintStatus.RESOLVED:
        return "Resolved";
      case ComplaintStatus.CLOSED:
        return "Closed";
      default:
        return status;
    }
  };

  return <span className={getBadgeClass()}>{getStatusText()}</span>;
}

export default StatusBadge;
