const StatusBadge = ({ status, type = 'complaint' }) => {
  const getStatusConfig = (status, type) => {
    if (type === 'complaint') {
      switch (status) {
        case 'pending':
          return {
            label: 'Pending',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            glow: '0 0 20px rgba(251, 191, 36, 0.4)',
            textColor: '#92400e'
          };
        case 'assigned':
          return {
            label: 'Assigned',
            gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            glow: '0 0 20px rgba(59, 130, 246, 0.4)',
            textColor: '#1e40af'
          };
        case 'in_progress':
          return {
            label: 'In Progress',
            gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            glow: '0 0 20px rgba(139, 92, 246, 0.4)',
            textColor: '#5b21b6'
          };
        case 'resolved':
          return {
            label: 'Resolved',
            gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            glow: '0 0 20px rgba(34, 197, 94, 0.4)',
            textColor: '#166534'
          };
        case 'rejected':
          return {
            label: 'Rejected',
            gradient: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
            glow: '0 0 20px rgba(244, 63, 94, 0.4)',
            textColor: '#9f1239'
          };
        default:
          return {
            label: status,
            gradient: 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)',
            glow: '0 0 20px rgba(161, 161, 170, 0.4)',
            textColor: '#52525b'
          };
      }
    }

    if (type === 'severity') {
      switch (status) {
        case 'low':
          return {
            label: 'Low',
            gradient: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
            glow: '0 0 20px rgba(74, 222, 128, 0.4)',
            textColor: '#166534'
          };
        case 'medium':
          return {
            label: 'Medium',
            gradient: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
            glow: '0 0 20px rgba(252, 211, 77, 0.4)',
            textColor: '#92400e'
          };
        case 'high':
          return {
            label: 'High',
            gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            glow: '0 0 20px rgba(239, 68, 68, 0.5)',
            textColor: '#991b1b'
          };
        default:
          return {
            label: status,
            gradient: 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)',
            glow: '0 0 20px rgba(161, 161, 170, 0.4)',
            textColor: '#52525b'
          };
      }
    }

    return {
      label: status,
      gradient: 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)',
      glow: '0 0 20px rgba(161, 161, 170, 0.4)',
      textColor: '#52525b'
    };
  };

  const { label, gradient, glow, textColor } = getStatusConfig(status, type);

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs tracking-wide transition-all duration-300 hover:scale-105"
      style={{
        background: gradient,
        color: textColor,
        boxShadow: `${glow}, 0 2px 8px rgba(0, 0, 0, 0.1)`,
        animation: 'badgePulse 2s ease-in-out infinite',
      }}
    >
      {label}
    </span>
  );
};

// Add the animation styles to index.css or base.css
const style = document.createElement('style');
style.textContent = `
  @keyframes badgePulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.9;
    }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('[data-badge-animation]')) {
  style.setAttribute('data-badge-animation', 'true');
  document.head.appendChild(style);
}

export default StatusBadge;
