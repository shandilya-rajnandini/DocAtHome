import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchNurses } from '../api';
import toast from 'react-hot-toast';

// --- Predefined Options for Nurse Filters ---
const nurseCategories = ['Elder Care', 'Child Care', 'Post-Operative Care', 'General Nursing (GNM)', 'Auxiliary Nursing (ANM)'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];

const SearchNursesPage = () => {
    // This 'filters' state is defined correctly here.
    const [filters, setFilters] = useState({ specialty: '', city: '' });
    const [nurses, setNurses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchNurses = async (currentFilters) => {
        setIsLoading(true);
        try {
            const { data } = await searchNurses(currentFilters);
            setNurses(data);
        } catch (err) {
            toast.error('Failed to fetch nurses. Please ensure the server is running.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch all nurses when the page first loads
    useEffect(() => {
        fetchNurses({});
    }, []);

    const handleApplyFilters = () => {
        fetchNurses(filters);
    };

    return (
        <div>
            {/* Header Section */}
            <div className="relative bg-[url('/nurse-header-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Find a Nurse</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
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
                    <button onClick={handleApplyFilters} className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover">
                        Apply Filters
                    </button>
                </aside>

                {/* Nurse Results */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <p className="text-center text-white">Loading...</p>
                    ) : nurses.length > 0 ? (
                        <div className="space-y-6">
                            {nurses.map(nurse => (
                                <NurseCard key={nurse._id} nurse={nurse} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-secondary-dark p-10 rounded-lg">
                            <p className="text-secondary-text text-xl">No nurses found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Nurse Card Component ---
const NurseCard = ({ nurse }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6">
        <img src="/nurse-avatar.jpg" alt={nurse.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
        <div className="flex-grow">
            <h3 className="text-2xl font-bold text-white">{nurse.name}</h3>
            <p className="text-teal-400 font-semibold">{nurse.specialty}</p>
            <p className="text-secondary-text mt-1">{nurse.city}</p>
            <div className="flex items-center gap-4 my-2 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded-full">{nurse.experience} Yrs</span>
            </div>
            <p className="text-lg font-semibold text-white mt-2">Fee: <span className="text-teal-400">₹600 / day</span></p>
        </div>
        <div className="flex items-center">
            <Link to={`/nurses/${nurse._id}`} className="bg-accent-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-blue-hover">
                View & Book
            </Link>
        </div>
    </div>
);

export default SearchNursesPage;