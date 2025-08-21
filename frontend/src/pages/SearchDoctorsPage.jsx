import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchDoctors } from '../api';
import toast from 'react-hot-toast';
import DoctorCardSkeleton from '../components/DoctorCardSkeleton';

const doctorSpecialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician', 'Neurologist'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];

const SearchDoctorsPage = () => {
    const [filters, setFilters] = useState({ specialty: '', city: '', radius: '10' });
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const fetchDoctors = async (currentFilters) => {
        setIsLoading(true);
        try {
            
            const { data } = await searchDoctors(currentFilters);

            // Handle new response format with patient location
            if (data.doctors) {
                setDoctors(data.doctors);
                
                // Store patient location in localStorage if provided
                if (data.patientLocation) {
                    localStorage.setItem('patientLocation', JSON.stringify(data.patientLocation));
                }
            } else {
                // Fallback for old response format
                setDoctors(data);
            }
        } catch (err) {
            toast.error('Failed to fetch doctors. Is the server running?');
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    
    // This hook runs ONLY once when the page first loads
    useEffect(() => {
        // Fetch ALL doctors initially by passing an empty filter object
        fetchDoctors({}); 
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = (e) => {
        e.preventDefault(); // Prevent form submission
        fetchDoctors(filters);
    };

    const clearLocationFilter = () => {
        setUserLocation(null);
        // Reset filters to remove lat/lng and search again
        const clearedFilters = { ...filters };
        delete clearedFilters.lat;
        delete clearedFilters.lng;
        setFilters(clearedFilters);
        fetchDoctors(clearedFilters);
        toast.success('Location filter cleared');
    };

    const findNearbyDoctors = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
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
                    radius: filters.radius || '10'
                };
                fetchDoctors(geoFilters);
                setIsGettingLocation(false);
                toast.success(`Found doctors within ${filters.radius || '10'}km of your location!`);
            },
            (error) => {
                setIsGettingLocation(false);
                console.error('Geolocation error:', error);
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Location access denied. Please select your city manually.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Location unavailable. Please select your city manually.');
                        break;
                    case error.TIMEOUT:
                        toast.error('Location request timed out. Please select your city manually.');
                        break;
                    default:
                        toast.error('Unable to get your location. Please select your city manually.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
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
                <form onSubmit={handleApplyFilters} className="lg:col-span-1 bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Filters</h2>
                    <div className="mb-6">
                        <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">Specialty</label>
                        <select name="specialty" value={filters.specialty} onChange={handleFilterChange} className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 ">
                            <option value="">All Specialties</option>
                            {doctorSpecialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                        </select>
                    </div>
                                        <div className="mb-6">
                        <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">City</label>
                        <select name="city" value={filters.city} onChange={handleFilterChange} className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 ">
                            <option value="">All Cities</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                                        <div className="mb-6">
                        <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">Location</label>
                        <div className="mb-3">
                            <label className="block text-sm text-slate-600 dark:text-secondary-text mb-1">Search Radius</label>
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
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Finding Your Location...
                                </>
                            ) : (
                                <>
                                    📍 Find Doctors Near Me ({filters.radius}km)
                                </>
                            )}
                        </button>
                        
                        {userLocation && (
                            <>
                                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200 p-3 rounded mb-3">
                                    📍 Searching within {filters.radius}km of your location
                                    <br />
                                    <span className="text-xs opacity-75">
                                        ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
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
                    {isLoading ? 'Searching...' : 'Search Doctors'}
                 </button>
                </form>

                {/* Results Section */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[...Array(3)].map((_, idx) => (
                                <DoctorCardSkeleton key={idx} />
                            ))}
                        </div>
                    ) : doctors.length > 0 ? (
                        <div className="space-y-6">
                            {doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} />)}
                        </div>
                    ) : (
                        <div className="text-center bg-white  dark:bg-secondary-dark p-10 rounded-lg">
                            <p className="text-black dark:text-secondary-text text-xl">No doctors found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// The DoctorCard component with enhanced distance display
const DoctorCard = ({ doctor }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6">
        <img src="/doctor-avatar.jpg" alt={doctor.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
        <div className="flex-grow">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{doctor.name}</h3>
                        {doctor.subscriptionTier === 'pro' && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                ⭐ PRO
                            </span>
                        )}
                    </div>
                    <p className="text-accent-blue font-semibold">{doctor.specialty}</p>
                    <p className="text-secondary-text mt-1">{doctor.city}</p>
                </div>
                {(doctor.distance !== undefined) && (
                    <div className="text-right">
                        {doctor.hasServiceArea ? (
                            <div className="space-y-1">
                                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm block">
                                    {doctor.withinDecagon ? '✅ In 10-Point Zone' : '✅ Service Area'}
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
                <span className="bg-gray-700 px-3 py-1 rounded-full">{doctor.experience} Yrs</span>
                <span className="text-yellow-400">{doctor.averageRating.toFixed(1)} ★ ({doctor.numReviews} reviews)</span>
            </div>
            <p className="text-lg font-semibold text-white mt-2">Fee: <span className="text-accent-blue">₹2000</span></p>
        </div>
        <div className="flex items-center">
            <Link to={`/doctors/${doctor._id}`} className="bg-accent-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-blue-hover">
                View & Book
            </Link>
        </div>
    </div>
);


export default SearchDoctorsPage;