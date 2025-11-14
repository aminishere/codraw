const LoadingButton = ({ 
  children, 
  loading, 
  disabled, 
  className = '', 
  ...props 
}) => {
  return (

    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full py-2 px-4 rounded-md transition duration-200 ${
        disabled || loading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : className
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
    
  );
};

export default LoadingButton;