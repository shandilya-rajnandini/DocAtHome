import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { searchDoctors } from "../api";
import toast from "react-hot-toast";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";
import Modal from "../components/Modal";
import MapComponent from "../components/MapComponent";
import SymptomBodyMap from "../components/SymptomBodyMap";
import axios from "axios";
import useApi from "../hooks/useApi";

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
        specialty: "", city: "", radius: "10", minExperience: "", maxExperience: "", sortBy: "rating_desc", skillKeyword: ""
    });
    const [doctors, setDoctors] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, totalDoctors: 0, limit: 6, hasNextPage: false, hasPrevPage: false,
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [locationFilterEnabled, setLocationFilterEnabled] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiSuggestion, setAISuggestion] = useState("");
    const [aiReasoning, setAIReasoning] = useState("");
    const [aiLoading, setAILoading] = useState(false);

  const {
    data: searchResponse,
    loading: isSearching,
    request: requestDoctors,
  } = useApi(searchDoctors, {
    defaultErrorMessage: "Failed to fetch doctors. Is the server running?",
    initialLoading: true,
  });

    const fetchDoctors = useCallback(async (currentFilters, page = 1) => {
        try {
            const queryParams = { ...currentFilters, page, limit: pagination.limit };
            
            if (viewMode === 'map') {
                queryParams.mapView = 'true';
            }
            
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === "" || queryParams[key] == null) delete queryParams[key];
            });

            const data = await requestDoctors(queryParams);

            if (data && data.doctors && data.pagination) {
                setDoctors(data.doctors);
                setPagination(data.pagination);
            } else if (data && data.doctors) {
                setDoctors(data.doctors);
                setPagination({ currentPage: 1, totalPages: 1, totalDoctors: data.doctors.length, limit: pagination.limit, hasNextPage: false, hasPrevPage: false });
            } else if (data) {
                setDoctors(data);
                setPagination({ currentPage: 1, totalPages: 1, totalDoctors: data.length, limit: pagination.limit, hasNextPage: false, hasPrevPage: false });
            }
        } catch (error) {
            toast.error("Failed to fetch doctors. Is the server running?");
            console.error("API Error:", error);
        }
    }, [pagination.limit, viewMode, requestDoctors]);

  useEffect(() => {
    fetchDoctors({}, 1);
  }, [fetchDoctors]);

    const handleFilterChange = (e) => {
        const newFilters = { ...filters, [e.target.name]: e.target.value };
        setFilters(newFilters);
        
        if (e.target.name === 'radius' && locationFilterEnabled && userLocation) {
            const updatedFilters = { ...newFilters, lat: userLocation.lat, lng: userLocation.lng };
            fetchDoctors(updatedFilters, 1);
        }
    };
    
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchDoctors(filters, 1);
    };

    const findNearbyDoctors = () => {
        if (!navigator.geolocation) return toast.error("Geolocation is not supported.");
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                const isValidLocation = latitude !== 0 && longitude !== 0;
                
                if (!isValidLocation) {
                    setIsGettingLocation(false);
                    toast.error("Location detection returned invalid coordinates. Please try again or select a city manually.");
                    return;
                }

                try {
                    const token = localStorage.getItem('token');
                    await fetch('/api/profile/location', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ latitude, longitude })
                    });

                    setUserLocation({ lat: latitude, lng: longitude });
                    setLocationFilterEnabled(true);
                    const newFilters = { ...filters, lat: latitude, lng: longitude, radius: filters.radius || "10" };
                    setFilters(newFilters);
                    fetchDoctors(newFilters, 1);
                    setIsGettingLocation(false);
                    toast.success(`Found doctors within ${newFilters.radius}km!`);
                } catch {
                    setIsGettingLocation(false);
                    toast.error("Failed to save location. Please try again.");
                }
            },
            () => {
                setIsGettingLocation(false);
                
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    const delhiCoords = { lat: 28.7041, lng: 77.1025 };
                    setUserLocation(delhiCoords);
                    setLocationFilterEnabled(true);
                    const newFilters = { ...filters, lat: delhiCoords.lat, lng: delhiCoords.lng, radius: filters.radius || "10" };
                    setFilters(newFilters);
                    fetchDoctors(newFilters, 1);
                    toast.info("Using Delhi coordinates for localhost development");
                } else {
                    toast.error("Unable to get your location. Please select a city manually.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    };

    const clearLocationFilter = () => {
        setUserLocation(null);
        setLocationFilterEnabled(false);
        const clearedFilters = { ...filters };
        delete clearedFilters.lat;
        delete clearedFilters.lng;
        delete clearedFilters.radius;
        setFilters(clearedFilters);
        fetchDoctors(clearedFilters, 1);
        toast.success("Location filter cleared");
    };

  const handleAIModalOpen = () => setShowAIModal(true);
  const handleAIModalClose = () => {
    setShowAIModal(false);
    setAISuggestion("");
    setAIReasoning("");
  };

  const handleAISubmit = async (symptoms) => {
    if (!symptoms.trim()) return toast.error("Please select your symptoms.");
    setAILoading(true);
    try {
      const { data } = await axios.post(
        "https://docathome-backend.onrender.com/api/ai/suggest-specialty",
        { symptoms }
      );
      setAISuggestion(data.specialty);
      setAIReasoning(data.reasoning || "");
      setFilters((f) => ({ ...f, specialty: data.specialty }));
      toast.success(`AI recommends: ${data.specialty}`);
    } catch {
      toast.error("Could not get a suggestion. Try again.");
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div>
      <div className="relative bg-[url('/search-header-bg.jpg')] bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white">Find Your Doctor</h1>
        </div>
      </div>

      <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <form
          onSubmit={handleApplyFilters}
          className="lg:col-span-1 bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg h-fit"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Filters
          </h2>

          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              Specialty
            </label>
            <div className="flex gap-2">
              <select
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
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
                Help
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">
              City
            </label>
            <div className="space-y-3">
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`w-full p-3 rounded font-semibold transition-colors ${
                  locationFilterEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={
                  locationFilterEnabled
                    ? clearLocationFilter
                    : findNearbyDoctors
                }
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? "Getting Location..."
                  : locationFilterEnabled
                  ? "🌍 Location Filter ON - Click to Disable"
                  : "📍 Enable Location Filter"}
              </button>

              {locationFilterEnabled && userLocation && (
                <div>
                  <label className="block text-slate-700 dark:text-secondary-text mb-1 text-sm font-semibold">
                    Search Radius
                  </label>
                  <select
                    name="radius"
                    value={filters.radius}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                  >
                    <option value="2">Within 2km</option>
                    <option value="5">Within 5km</option>
                    <option value="10">Within 10km</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="skillKeyword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search by Verified Skills
            </label>
            <input
              type="text"
              id="skillKeyword"
              name="skillKeyword"
              value={filters.skillKeyword}
              onChange={handleFilterChange}
              placeholder="e.g., Diabetes Management"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover disabled:opacity-50"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search Doctors"}
          </button>
        </form>

        <main className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {pagination.totalDoctors} Doctor
                {pagination.totalDoctors !== 1 ? "s" : ""} Found
                {locationFilterEnabled && userLocation && (
                  <span className="text-green-600 text-sm font-normal ml-2">
                    (within {filters.radius}km of your location)
                  </span>
                )}
              </h2>
            </div>
            <div className="flex bg-gray-200 dark:bg-primary-dark rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode("list");
                  setTimeout(
                    () => fetchDoctors(filters, pagination.currentPage),
                    0
                  );
                }}
                className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-accent-blue text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => {
                  setViewMode("map");
                  setTimeout(() => fetchDoctors(filters, 1), 0);
                }}
                className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                  viewMode === "map"
                    ? "bg-accent-blue text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                🗺️ Map View
              </button>
            </div>
          </div>

          {isSearching ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, idx) => (
                <DoctorCardSkeleton key={idx} />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div>
              {viewMode === "list" ? (
                <div className="space-y-6">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              ) : (
                <MapComponent
                  doctors={doctors}
                  userLocation={userLocation}
                  filteredByLocation={locationFilterEnabled}
                />
              )}

              {viewMode === "list" && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() =>
                      fetchDoctors(filters, pagination.currentPage - 1)
                    }
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 bg-accent-blue text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 dark:text-gray-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      fetchDoctors(filters, pagination.currentPage + 1)
                    }
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-accent-blue text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-secondary-dark p-10 rounded-lg">
              <p className="text-black dark:text-secondary-text text-xl">
                No doctors found matching your criteria.
              </p>
              {locationFilterEnabled && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  Try increasing your search radius or disabling location
                  filter.
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={showAIModal} onClose={handleAIModalClose}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            AI Specialty Suggestion
          </h2>
          <SymptomBodyMap onSubmit={handleAISubmit} />
          {aiSuggestion && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Recommended: {aiSuggestion}
              </h3>
              {aiReasoning && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  {aiReasoning}
                </p>
              )}
            </div>
          )}
          {aiLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Analyzing your symptoms...
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const DoctorCard = ({ doctor }) => (
  <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6">
    <img
      src="/doctor-avatar.jpg"
      alt={doctor.name}
      className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-gray-700"
    />
    <div className="flex-grow text-center md:text-left">
      <h3 className="text-2xl font-bold text-white">{doctor.name}</h3>
      {doctor.subscriptionTier === "pro" && (
        <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
          ⭐ PRO
        </span>
      )}
      <p className="text-accent-blue font-semibold">{doctor.specialty}</p>
      <p className="text-secondary-text mt-1">{doctor.city}</p>
      {doctor.distance !== undefined && (
        <p className="text-green-400 text-sm">
          📍 Approx. {doctor.distance}km away
        </p>
      )}
      <div className="flex justify-center md:justify-start items-center gap-4 my-2 text-sm">
        <span className="bg-gray-700 px-3 py-1 rounded-full">
          {doctor.experience} Yrs Experience
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
    <div className="flex-shrink-0 flex items-center justify-center">
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
