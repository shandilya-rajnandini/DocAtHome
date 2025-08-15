import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchNurses } from '../api';
import { toast } from 'react-hot-toast';

// --- Predefined Options for Nurse Filters ---
// These arrays populate the dropdown menus.
const nurseCategories = ['Elder Care', 'Child Care', 'Post-Operative Care', 'General Nursing (GNM)', 'Auxiliary Nursing (ANM)'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];

const SearchNursesPage = () => {
    // State to hold the selected filter values
    const [filters, setFilters] = useState({ specialty: '', city: '', radius: '10' });
    // State for user location and geolocation status
    const [userLocation, setUserLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    // State to store patient location for distance calculations
    const [patientLocation, setPatientLocation] = useState({ lat: null, lng: null });
    // State to store the list of nurses fetched from the API
    const [nurses, setNurses] = useState([]);
    // State to show a loading message while data is being fetched
    const [isLoading, setIsLoading] = useState(false);
    // State to store any errors that occur during fetching
    const [error, setError] = useState('');

    // Load patient location from localStorage on component mount
    useEffect(() => {
        const savedLocation = localStorage.getItem('patientLocation');
        if (savedLocation) {
            try {
                const location = JSON.parse(savedLocation);
                setPatientLocation(location);
            } catch (error) {
                console.error('Error parsing saved patient location:', error);
            }
        }
    }, []);

    // This function updates the filter state whenever a dropdown is changed
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // This function calls the backend API to get nurses based on the current filters
    const handleSearch = async (searchFilters = filters) => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await searchNurses(searchFilters);
            
            // Handle new response format with patient location
            if (data.nurses) {
                setNurses(data.nurses);
                
                // Store patient location in localStorage if provided
                if (data.patientLocation) {
                    localStorage.setItem('patientLocation', JSON.stringify(data.patientLocation));
                }
            } else {
                // Fallback for old response format
                setNurses(data);
            }
        } catch (err) {
            setError('Failed to fetch nurses. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearLocationFilter = () => {
        setUserLocation(null);
        // Reset filters to remove lat/lng and search again
        const clearedFilters = { ...filters };
        delete clearedFilters.lat;
        delete clearedFilters.lng;
        setFilters(clearedFilters);
        handleSearch(clearedFilters);
        toast.success('Location filter cleared');
    };

    const findNearbyNurses = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                
                // Search for nurses with geolocation
                const geoFilters = {
                    ...filters,
                    lat: latitude,
                    lng: longitude,
                    radius: filters.radius || '10'
                };
                handleSearch(geoFilters);
                setIsGettingLocation(false);
                toast.success(`Found nurses within ${filters.radius || '10'}km of your location!`);
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
    
    // This hook runs once when the component first loads to get the initial list of all nurses
    useEffect(() => {
        handleSearch();
    }, []);
// ... inside the SearchNursesPage component's return statement

    return (
        <div>
            {/* --- Header Section with Background Image --- */}
            {/* We will add the bg-[url()] class here */}
            <div className="relative bg-[url('/nurse-header-bg.jpg')] bg-cover bg-center h-60 md:h-80">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">Find a Nurse</h1>
                    <p className="text-lg md:text-xl text-gray-300 mt-4">Book skilled and compassionate nurses for personalized home care.</p>
                </div>
            </div>

            

            {/* --- Main Content Area with Filters and Results --- */}
            <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* --- Left Sidebar: Filters --- */}
                <aside className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-white mb-6">Filters</h2>
                    
                    <div className="mb-6">
                        <label className="block text-secondary-text mb-2 font-semibold">Care Category</label>
                        <select name="specialty" value={filters.specialty} onChange={handleFilterChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white">
                            <option value="">All Categories</option>
                            {nurseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                                        <div className="mb-6">
                        <label className="block text-secondary-text mb-2 font-semibold">City</label>
                        <select name="city" value={filters.city} onChange={handleFilterChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white">
                            <option value="">All Cities</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-secondary-text mb-2 font-semibold">Location</label>
                        <div className="mb-3">
                            <label className="block text-sm text-slate-600 dark:text-secondary-text mb-1">Search Radius</label>
                            <select 
                                name="radius" 
                                value={filters.radius} 
                                onChange={handleFilterChange} 
                                className="w-full p-2 bg-primary-dark text-white rounded border-gray-700 text-sm"
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
                            onClick={findNearbyNurses}
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
                                    📍 Find Nurses Near Me ({filters.radius}km)
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

                    <button onClick={handleSearch} className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition">
                        Search Nurses
                    </button>
                </aside>

                {/* --- Right Section: Nurse Results --- */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto"></div>
                            <p className="text-secondary-text mt-4">Searching for nurses...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 text-xl">{error}</div>
                    ) : nurses.length > 0 ? (
                        <div className="space-y-6">
                            {/* Results Summary */}
                            <div className="text-secondary-text text-lg">
                                Found <span className="text-teal-400 font-semibold">{nurses.length}</span> nurse(s)
                                {(patientLocation.lat && patientLocation.lng) && (
                                    <span> within {filters.radius}km radius</span>
                                )}
                            </div>
                            
                            {/* Nurse Cards Grid */}
                            {nurses.map(nurse => (
                                <NurseCard key={nurse._id} nurse={nurse} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-secondary-text text-xl bg-secondary-dark p-10 rounded-lg">
                            No nurses found matching your criteria.
                            {(patientLocation.lat && patientLocation.lng) && (
                                <div className="mt-2 text-sm">
                                    Try adjusting your search filters or location range.
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Enhanced Nurse Card Component with Distance Display ---
const NurseCard = ({ nurse }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6">
        <img src="/nurse-avatar.jpg" alt={nurse.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 flex-shrink-0" />
        <div className="flex-grow">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{nurse.name}</h3>
                        {nurse.subscriptionTier === 'pro' && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                ⭐ PRO
                            </span>
                        )}
                    </div>
                    <p className="text-teal-400 font-semibold">{nurse.specialty}</p>
                    <p className="text-secondary-text mt-1">{nurse.city}</p>
                </div>
                {(nurse.distance !== undefined) && (
                    <div className="text-right">
                        {nurse.hasServiceArea ? (
                            <div className="space-y-1">
                                <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm block">
                                    {nurse.withinDecagon ? '✅ In 10-Point Zone' : '✅ Service Area'}
                                </span>
                                {nurse.distance > 0 && (
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs block">
                                        📍 {nurse.distance}km from center
                                    </span>
                                )}
                            </div>
                        ) : nurse.estimatedFromCity ? (
                            <div className="space-y-1">
                                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm block">
                                    📍 {nurse.distance}km away
                                </span>
                                <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs block">
                                    📍 Estimated from city
                                </span>
                            </div>
                        ) : (
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                📍 {nurse.distance}km away
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4 my-2 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded-full">{nurse.experience} Yrs Experience</span>
                {nurse.averageRating && (
                    <span className="text-yellow-400">{nurse.averageRating.toFixed(1)} ★ ({nurse.numReviews || 0} reviews)</span>
                )}
            </div>
            <p className="text-lg font-semibold text-white mt-2">
                Service Fee: <span className="text-teal-400">₹600 / day</span>
            </p>
        </div>
        <div className="flex items-center">
            <Link to={`/nurses/${nurse._id}`} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 transition">
                View & Book
            </Link>
        </div>
    </div>
);

// This line makes the component available to be used in App.jsx
export default SearchNursesPage;