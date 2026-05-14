import React from 'react';

export const LoadingSpinner = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        <p className="text-white mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-800 rounded-lg p-5 border border-neutral-700"
        >
          <div className="flex gap-5">
            <div className="w-16 h-24 bg-neutral-700 rounded animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${props.className} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Đang xử lý...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
