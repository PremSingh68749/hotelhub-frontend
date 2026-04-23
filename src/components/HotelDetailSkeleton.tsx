import React from 'react';

export default function HotelDetailSkeleton(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Hotel Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Info Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
