import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const DemandHotspotPage = () => {
  const { user } = useAuthStore();

  // Redirect if not Pro user
  if (!user || user.subscriptionTier !== "pro") {
    return <Navigate to="/upgrade-pro" />;
  }

  // Mock data for demonstration
  const hotspotData = [
    {
      area: "Bandra, Mumbai",
      demand: "High",
      specialty: "Cardiology",
      avgFee: "₹3,500",
    },
    {
      area: "Koramangala, Bangalore",
      demand: "Medium",
      specialty: "Pediatrics",
      avgFee: "₹2,800",
    },
    {
      area: "Defence Colony, Delhi",
      demand: "High",
      specialty: "General Medicine",
      avgFee: "₹3,200",
    },
    {
      area: "Hitech City, Hyderabad",
      demand: "Medium",
      specialty: "Dermatology",
      avgFee: "₹2,500",
    },
    {
      area: "Park Street, Kolkata",
      demand: "Low",
      specialty: "Gynecology",
      avgFee: "₹2,200",
    },
  ];

  const getDemandColor = (demand) => {
    switch (demand) {
      case "High":
        return "text-red-500 bg-red-100 dark:bg-red-900";
      case "Medium":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900";
      case "Low":
        return "text-green-500 bg-green-100 dark:bg-green-900";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-900";
    }
  };

  return (
    <div className="min-h-screen bg-accent-cream dark:bg-primary-dark py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              📊 Demand Hotspot Map
            </h1>
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold">
              PRO FEATURE
            </span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Analyze patient demand patterns and optimize your service areas for
            maximum earnings.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">24</div>
            <div className="text-gray-600 dark:text-gray-300">Active Areas</div>
          </div>
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600">8</div>
            <div className="text-gray-600 dark:text-gray-300">
              High Demand Zones
            </div>
          </div>
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600">₹3,200</div>
            <div className="text-gray-600 dark:text-gray-300">
              Avg Fee/Consultation
            </div>
          </div>
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">15%</div>
            <div className="text-gray-600 dark:text-gray-300">
              Growth This Month
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Interactive Demand Map
          </h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                Interactive Map Coming Soon
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                This will show real-time patient demand heatmaps across
                different areas
              </p>
            </div>
          </div>
        </div>

        {/* Hotspot Data Table */}
        <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Top Demand Areas
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Areas with highest patient demand in your specialty
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Demand Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Top Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {hotspotData.map((spot, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {spot.area}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandColor(spot.demand)}`}
                      >
                        {spot.demand}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {spot.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {spot.avgFee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
                        Expand Here
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💡 AI Insights
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Peak Hours:</strong> Most appointments are booked
                  between 6-9 PM on weekdays
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Opportunity:</strong> Consider expanding to Powai area
                  - 40% increase in demand
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Trend:</strong> Video consultations growing 25%
                  month-over-month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📈 Revenue Optimizer
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Current Earnings
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹45,000/month
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Potential Earnings
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    ₹75,000/month
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                By expanding to high-demand areas, you could increase earnings
                by 67%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandHotspotPage;
