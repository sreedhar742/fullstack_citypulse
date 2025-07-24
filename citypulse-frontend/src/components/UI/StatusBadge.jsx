const StatusBadge = ({ status, type = 'complaint' }) => {
  const getStatusConfig = (status, type) => {
    if (type === 'complaint') {
      switch (status) {
        case 'pending':
          return { label: 'Pending', className: 'badge-warning' };
        case 'assigned':
          return { label: 'Assigned', className: 'badge-primary' };
        case 'in_progress':
          return { label: 'In Progress', className: 'badge-primary' };
        case 'resolved':
          return { label: 'Resolved', className: 'badge-success' };
        case 'rejected':
          return { label: 'Rejected', className: 'badge-danger' };
        default:
          return { label: status, className: 'badge-gray' };
      }
    }
    
    if (type === 'severity') {
      switch (status) {
        case 'low':
          return { label: 'Low', className: 'badge-success' };
        case 'medium':
          return { label: 'Medium', className: 'badge-warning' };
        case 'high':
          return { label: 'High', className: 'badge-danger' };
        default:
          return { label: status, className: 'badge-gray' };
      }
    }

    return { label: status, className: 'badge-gray' };
  };

  const { label, className } = getStatusConfig(status, type);

  return <span className={`badge ${className}`}>{label}</span>;
};

export default StatusBadge;