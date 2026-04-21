'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onRatingChange(starValue);
    }
  };

  const handleHalfStarClick = (starValue: number) => {
    if (!disabled) {
      onRatingChange(starValue + 0.5);
    }
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFullStar = rating >= starValue;
    const isHalfStar = rating >= starValue - 0.5 && rating < starValue;
    const isEmptyStar = rating < starValue - 0.5;

    return (
      <div key={index} className="relative inline-block">
        {/* Empty star (background) */}
        <svg
          className={`${sizeClasses[size]} ${isEmptyStar ? 'text-gray-300' : 'text-gray-200'} cursor-pointer transition-colors`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleStarClick(starValue - 1)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        
        {/* Half star overlay */}
        {isHalfStar && (
          <svg
            className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0 cursor-pointer transition-colors`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => handleHalfStarClick(index)}
          >
            <defs>
              <linearGradient id={`half-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill={`url(#half-${index})`} />
          </svg>
        )}
        
        {/* Full star */}
        {isFullStar && (
          <svg
            className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0 cursor-pointer transition-colors`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => handleStarClick(starValue)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {/* Click area for half star */}
        {!disabled && (
          <div
            className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-10"
            onClick={() => handleHalfStarClick(index)}
          />
        )}
        
        {/* Click area for full star */}
        {!disabled && (
          <div
            className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-10"
            onClick={() => handleStarClick(starValue)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map(renderStar)}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 ? `${rating} stars` : 'Click to rate'}
      </span>
    </div>
  );
};
