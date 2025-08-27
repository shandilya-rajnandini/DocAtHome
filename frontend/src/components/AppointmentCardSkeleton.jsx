import React from "react";

const AppointmentCardSkeleton = () => (
  <div className="bg-accent-cream dark:bg-primary-dark p-5 rounded-lg shadow-lg border border-gray-700 hover:border-accent transition-all duration-300 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between">
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="w-8 h-8 bg-gray-700 rounded-full mr-4" />
        <div>
          <div className="h-6 w-32 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-20 bg-gray-700 rounded" />
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-6 w-24 bg-gray-700 rounded-full" />
        <div className="h-8 w-28 bg-gray-700 rounded" />
      </div>
    </div>
    <div className="border-t border-gray-700 my-4"></div>
    <div className="flex justify-between items-center text-secondary-text">
      <div>
        <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-16 bg-gray-700 rounded" />
      </div>
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-16 bg-gray-700 rounded" />
        <div className="h-4 w-16 bg-gray-700 rounded mt-2" />
      </div>
    </div>
  </div>
);

export default AppointmentCardSkeleton;