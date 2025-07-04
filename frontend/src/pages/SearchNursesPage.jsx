import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchNurses } from '../api';

// --- Predefined Options for Nurse Filters ---
// These arrays populate the dropdown menus.
const nurseCategories = ['Elder Care', 'Child Care', 'Post-Operative Care', 'General Nursing (GNM)', 'Auxiliary Nursing (ANM)'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];

const SearchNursesPage = () => {
    // State to hold the selected filter values
    const [filters, setFilters] = useState({ specialty: '', city: '' });
    // State to store the list of nurses fetched from the API
    const [nurses, setNurses] = useState([]);
    // State to show a loading message while data is being fetched
    const [isLoading, setIsLoading] = useState(false);
    // State to store any errors that occur during fetching
    const [error, setError] = useState('');

    // This function updates the filter state whenever a dropdown is changed
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // This function calls the backend API to get nurses based on the current filters
    const handleSearch = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await searchNurses(filters);
            setNurses(data);
        } catch (err) {
            setError('Failed to fetch nurses. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
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

                    <button onClick={handleSearch} className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition">
                        Apply Filters
                    </button>
                </aside>

                {/* --- Right Section: Nurse Results --- */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <div className="text-center text-white text-xl">Loading nurses...</div>
                    ) : error ? (
                        <div className="text-center text-red-500 text-xl">{error}</div>
                    ) : nurses.length > 0 ? (
                        <div className="space-y-6">
                            {nurses.map(nurse => (
                                <NurseCard key={nurse._id} nurse={nurse} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-secondary-text text-xl bg-secondary-dark p-10 rounded-lg">
                            No nurses found matching your criteria. Please register some nurses to see them here.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Nurse Card Component (defined in the same file) ---
const NurseCard = ({ nurse }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6">
        <img src="/nurse-avatar.jpg" alt={nurse.name} className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-gray-700" />
        <div className="flex-grow text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">{nurse.name}</h3>
            <p className="text-accent-blue font-semibold">{nurse.specialty}</p>
            <p className="text-secondary-text mt-1">{nurse.city}</p>
            <div className="flex justify-center md:justify-start items-center gap-4 my-2 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded-full">{nurse.experience} Yrs Experience</span>
            </div>
            <p className="text-lg font-semibold text-white mt-4">
                Service Fee: <span className="text-accent-blue">₹600 / day</span> {/* This is a placeholder fee */}
            </p>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center">
            {/* This link will go to a future Nurse Profile page */}
            <Link to={`/nurses/${nurse._id}`} className="bg-accent-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-blue-hover transition">
                View & Book
            </Link>
        </div>
    </div>
);

// This line makes the component available to be used in App.jsx
export default SearchNursesPage;