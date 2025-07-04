import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchDoctors } from '../api';
import toast from 'react-hot-toast';

const doctorSpecialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician', 'Neurologist'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];

const SearchDoctorsPage = () => {
    const [filters, setFilters] = useState({ specialty: '', city: '' });
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDoctors = async (currentFilters) => {
        setIsLoading(true);
        try {
            // Pass the filters object directly to the API call
            const { data } = await searchDoctors(currentFilters);
            setDoctors(data);
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

    return (
        <div>
            {/* Header Section */}
            <div className="relative bg-[url('/search-header-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Find Your Doctor</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <form onSubmit={handleApplyFilters} className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-white mb-6">Filters</h2>
                    <div className="mb-6">
                        <label className="block text-secondary-text mb-2 font-semibold">Specialty</label>
                        <select name="specialty" value={filters.specialty} onChange={handleFilterChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white">
                            <option value="">All Specialties</option>
                            {doctorSpecialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-secondary-text mb-2 font-semibold">City</label>
                        <select name="city" value={filters.city} onChange={handleFilterChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white">
                            <option value="">All Cities</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover">
                        Apply Filters
                    </button>
                </form>

                {/* Results Section */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <p className="text-center text-white">Loading...</p>
                    ) : doctors.length > 0 ? (
                        <div className="space-y-6">
                            {doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} />)}
                        </div>
                    ) : (
                        <div className="text-center bg-secondary-dark p-10 rounded-lg">
                            <p className="text-secondary-text text-xl">No doctors found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// The DoctorCard component remains the same
const DoctorCard = ({ doctor }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6">
        <img src="/doctor-avatar.jpg" alt={doctor.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
        <div className="flex-grow">
            <h3 className="text-2xl font-bold text-white">{doctor.name}</h3>
            <p className="text-accent-blue font-semibold">{doctor.specialty}</p>
            <p className="text-secondary-text mt-1">{doctor.city}</p>
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