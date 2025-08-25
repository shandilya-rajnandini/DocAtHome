import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchDoctors } from "../api";
import toast from "react-hot-toast";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";

// --- NEW IMPORTS ---
import Modal from "../components/Modal.jsx";
import axios from "axios";

const doctorSpecialties = [
  "Cardiologist",
  "Dermatologist",
  "Gynecologist",
  "Dentist",
  "Pediatrician",
  "General Physician",
  "Neurologist",
];
const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Patna",
  "Kolkata",
  "Chennai",
];

const SearchDoctorsPage = () => {
  const [filters, setFilters] = useState({
    specialty: "",
    city: "",
    radius: "10",
    minExperience: "",
    maxExperience: "",
    sortBy: "rating_desc",
  });
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // --- AI MODAL STATE ---
  const [showAIModal, setShowAIModal] = useState(false);
  const [symptomsInput, setSymptomsInput] = useState("");
  const [aiSuggestion, setAISuggestion] = useState("");
  const [aiReasoning, setAIReasoning] = useState("");
  const [aiLoading, setAILoading] = useState(false);

  const fetchDoctors = async (currentFilters, page = 1) => {
    setIsLoading(true);
    try {
      // Prepare query parameters
      const queryParams = {
        ...currentFilters,
        page: page,
        limit: pagination.limit,
      };

      // Remove empty values
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] == null) {
          delete queryParams[key];
        }
      });

      const { data } = await searchDoctors(queryParams);

      // Handle new response format with pagination
      if (data.doctors && data.pagination) {
        setDoctors(data.doctors);
        setPagination(data.pagination);

        // Store patient location in localStorage if provided
        if (data.patientLocation) {
          localStorage.setItem(
            "patientLocation",
            JSON.stringify(data.patientLocation)
          );
        }
      } else {
        // Fallback for old response format
        setDoctors(data.doctors || data);
        // Reset pagination if not provided
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalDoctors: data.doctors ? data.doctors.length : data.length,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch doctors. Is the server running?");
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // This hook runs ONLY once when the page first loads
  useEffect(() => {
    // Fetch ALL doctors initially by passing an empty filter object
    fetchDoctors({}, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault(); // Prevent form submission
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
    fetchDoctors(filters, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDoctors(filters, newPage);
    }
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    // Reset filters to remove lat/lng and search again
    const clearedFilters = { ...filters };
    delete clearedFilters.lat;
    delete clearedFilters.lng;
    setFilters(clearedFilters);
    fetchDoctors(clearedFilters, 1);
    toast.success("Location filter cleared");
  };

  const findNearbyDoctors = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Search for doctors with geolocation
        const geoFilters = {
          ...filters,
          lat: latitude,
          lng: longitude,
          radius: filters.radius || "10",
        };
        fetchDoctors(geoFilters, 1);
        setIsGettingLocation(false);
        toast.success(
          `Found doctors within ${filters.radius || "10"}km of your location!`
        );
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location access denied. Please select your city manually."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error(
              "Location unavailable. Please select your city manually."
            );
            break;
          case error.TIMEOUT:
            toast.error(
              "Location request timed out. Please select your city manually."
            );
            break;
          default:
            toast.error(
              "Unable to get your location. Please select your city manually."
            );
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // --- AI SUGGESTION HANDLERS ---
  const handleAIModalOpen = () => {
    setShowAIModal(true);
    setSymptomsInput("");
    setAISuggestion("");
  };

  const handleAIModalClose = () => {
    setShowAIModal(false);
    setSymptomsInput("");
    setAISuggestion("");
    setAIReasoning("");
  };

  const handleAISubmit = async () => {
    if (!symptomsInput.trim()) {
      toast.error("Please enter your symptoms.");
      return;
    }
    setAILoading(true);
    try {
      const { data } = await axios.post("/api/ai/suggest-specialty", {
        symptoms: symptomsInput,
      });
      setAISuggestion(data.specialty);
      setAIReasoning(data.reasoning || "");
      setFilters((f) => ({ ...f, specialty: data.specialty }));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Could not get a suggestion. Try again.");
      setAISuggestion("");
      setAIReasoning("");
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="relative bg-[url('/search-header-bg.jpg')] bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white">Find Your Doctor</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container  mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <form
          onSubmit={handleApplyFilters}
          className="lg:col-span-1 bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg h-fit"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Filters
          </h2>

          {/* Specialty Filter */}
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              Specialty
            </label>
            <div className="flex gap-2">
              <select
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 "
              >
                <option value="">All Specialties</option>
                {doctorSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 font-semibold"
                onClick={handleAIModalOpen}
              >
                Need help choosing?
              </button>
            </div>
          </div>

          {/* City Filter */}
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              City
            </label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 "
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              Years of Experience
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-slate-600 dark:text-secondary-text mb-1">
                  Min Years
                </label>
                <select
                  name="minExperience"
                  value={filters.minExperience}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+ years</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="10">10+ years</option>
                  <option value="15">15+ years</option>
                  <option value="20">20+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-secondary-text mb-1">
                  Max Years
                </label>
                <select
                  name="maxExperience"
                  value={filters.maxExperience}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 text-sm"
                >
                  <option value="">Any</option>
                  <option value="5">Up to 5 years</option>
                  <option value="10">Up to 10 years</option>
                  <option value="15">Up to 15 years</option>
                  <option value="20">Up to 20 years</option>
                  <option value="30">Up to 30 years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sort By Filter */}
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
            >
              <option value="rating_desc">Rating (High to Low)</option>
              <option value="rating_asc">Rating (Low to High)</option>
              <option value="experience_desc">Experience (High to Low)</option>
              <option value="experience_asc">Experience (Low to High)</option>
              <option value="name_asc">Name (A to Z)</option>
              <option value="name_desc">Name (Z to A)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              Location
            </label>
            <div className="mb-3">
              <label className="block text-sm text-slate-600 dark:text-secondary-text mb-1">
                Search Radius
              </label>
              <select
                name="radius"
                value={filters.radius}
                onChange={handleFilterChange}
                className="w-full p-2 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 text-sm"
              >
                <option value="5">5 km radius</option>
                <option value="8">8 km radius</option>
                <option value="10">10 km radius</option>
                <option value="15">15 km radius</option>
                <option value="20">20 km radius</option>
              </select>
            </div>
            <button
              type="button"
              onClick={findNearbyDoctors}
              disabled={isGettingLocation}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            >
              {isGettingLocation ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Finding Your Location...
                </>
              ) : (
                <>📍 Find Doctors Near Me ({filters.radius}km)</>
              )}
            </button>

            {userLocation && (
              <>
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200 p-3 rounded mb-3">
                  📍 Searching within {filters.radius}km of your location
                  <br />
                  <span className="text-xs opacity-75">
                    ({userLocation.lat.toFixed(4)},{" "}
                    {userLocation.lng.toFixed(4)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearLocationFilter}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  🗑️ Clear Location Filter
                </button>
              </>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search Doctors"}
          </button>
        </form>

        {/* Results Section */}
        <main className="lg:col-span-3">
          {/* Results Summary */}
          {!isLoading && (
            <div className="mb-6 p-4 bg-white dark:bg-secondary-dark rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-700 dark:text-secondary-text">
                    Showing {doctors.length} of {pagination.totalDoctors}{" "}
                    doctors
                    {pagination.totalPages > 1 && (
                      <span>
                        {" "}
                        (Page {pagination.currentPage} of{" "}
                        {pagination.totalPages})
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-slate-600 dark:text-secondary-text">
                  {filters.sortBy && (
                    <span>
                      Sorted by:{" "}
                      {filters.sortBy === "rating_desc"
                        ? "Rating (High to Low)"
                        : filters.sortBy === "rating_asc"
                        ? "Rating (Low to High)"
                        : filters.sortBy === "experience_desc"
                        ? "Experience (High to Low)"
                        : filters.sortBy === "experience_asc"
                        ? "Experience (Low to High)"
                        : filters.sortBy === "name_asc"
                        ? "Name (A to Z)"
                        : filters.sortBy === "name_desc"
                        ? "Name (Z to A)"
                        : "Default"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, idx) => (
                <DoctorCardSkeleton key={idx} />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <>
              <div className="space-y-6">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const currentPage = pagination.currentPage;
                    const totalPages = pagination.totalPages;

                    // Show first page
                    if (currentPage > 3) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          1
                        </button>
                      );
                      if (currentPage > 4) {
                        pages.push(
                          <span
                            key="ellipsis1"
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                    }

                    // Show current page and surrounding pages
                    for (
                      let i = Math.max(1, currentPage - 2);
                      i <= Math.min(totalPages, currentPage + 2);
                      i++
                    ) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            i === currentPage
                              ? "bg-blue-600 text-white border border-blue-600"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Show last page
                    if (currentPage < totalPages - 2) {
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <span
                            key="ellipsis2"
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center bg-white  dark:bg-secondary-dark p-10 rounded-lg">
              <p className="text-black dark:text-secondary-text text-xl">
                No doctors found matching your criteria.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* AI Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={handleAIModalClose}
        showDefaultClose={false}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Describe your Symptoms
                </h2>
                <p className="text-slate-600 dark:text-gray-300 text-sm">
                  For personalized recommendations
                </p>
              </div>
            </div>
            <button
              onClick={handleAIModalClose}
              aria-label="Close"
              className="p-2 rounded-full transition-all duration-200 bg-gray-100 dark:bg-gray-700 hover:bg-red-500/20 dark:hover:bg-red-500/30 group"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-colors duration-200"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="space-y-6">
            {/* Symptoms input */}
            <div>
              <textarea
                className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 dark:bg-gray-800 dark:text-white transition-all duration-200 resize-none shadow-inner"
                rows={3}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Describe your symptoms in detail... e.g., 'I have a persistent headache with nausea and sensitivity to light'"
              />
            </div>

            {/* Submit button */}
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              onClick={handleAISubmit}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing your symptoms...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                  Get AI Recommendation
                </div>
              )}
            </button>

            {/* Results */}
            {aiSuggestion && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg border-l-4 border-green-500 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600 dark:text-green-400"
                      />
                    </svg>
                    <h3 className="text-green-800 dark:text-green-200 font-bold text-sm">
                      Recommendation
                    </h3>
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    We recommend seeing a{" "}
                    <span className="font-bold">{aiSuggestion}.</span>
                  </p>
                </div>

                {aiReasoning && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg border-l-4 border-blue-500 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </svg>
                      <h4 className="text-blue-800 dark:text-blue-200 font-bold text-sm">
                        Why this recommendation?
                      </h4>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                      {aiReasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// The DoctorCard component with enhanced distance display and experience info
const DoctorCard = ({ doctor }) => (
  <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6">
    <img
      src="/doctor-avatar.jpg"
      alt={doctor.name}
      className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
    />
    <div className="flex-grow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-white">{doctor.name}</h3>
            {doctor.subscriptionTier === "pro" && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                ⭐ PRO
              </span>
            )}
          </div>
          <p className="text-accent-blue font-semibold">{doctor.specialty}</p>
          <p className="text-secondary-text mt-1">{doctor.city}</p>
        </div>
        {doctor.distance !== undefined && (
          <div className="text-right">
            {doctor.hasServiceArea ? (
              <div className="space-y-1">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm block">
                  {doctor.withinDecagon
                    ? "✅ In 10-Point Zone"
                    : "✅ Service Area"}
                </span>
                {doctor.distance > 0 && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs block">
                    📍 {doctor.distance}km from center
                  </span>
                )}
              </div>
            ) : doctor.estimatedFromCity ? (
              <div className="space-y-1">
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm block">
                  📍 {doctor.distance}km away
                </span>
                <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs block">
                  📍 Estimated from city
                </span>
              </div>
            ) : (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                📍 {doctor.distance}km away
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 my-2 text-sm">
        <span className="bg-gray-700 px-3 py-1 rounded-full">
          {doctor.experience} Year{doctor.experience !== 1 ? "s" : ""}{" "}
          Experience
        </span>
        <span className="text-yellow-400">
          {doctor.averageRating ? doctor.averageRating.toFixed(1) : "0.0"} ★ (
          {doctor.numReviews || 0} reviews)
        </span>
      </div>
      <p className="text-lg font-semibold text-white mt-2">
        Fee: <span className="text-accent-blue">₹2000</span>
      </p>
    </div>
    <div className="flex items-center">
      <Link
        to={`/doctors/${doctor._id}`}
        className="bg-accent-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-blue-hover"
      >
        View & Book
      </Link>
    </div>
  </div>
);

export default SearchDoctorsPage;
