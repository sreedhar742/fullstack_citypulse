const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const borderSizes = {
    sm: 'border-[3px]',
    md: 'border-[4px]',
    lg: 'border-[5px]',
    xl: 'border-[6px]',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Outer rotating gradient ring */}
        <div
          className={`${sizeClasses[size]} ${borderSizes[size]} rounded-full animate-spin`}
          style={{
            border: '4px solid transparent',
            borderTopColor: '#667eea',
            borderRightColor: '#764ba2',
            borderBottomColor: '#f093fb',
            borderLeftColor: '#f5576c',
            animation: 'spin 1s linear infinite, colorShift 3s ease-in-out infinite',
          }}
        />
        {/* Inner pulsing dot */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '10px',
            height: size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 0 15px rgba(102, 126, 234, 0.6)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
