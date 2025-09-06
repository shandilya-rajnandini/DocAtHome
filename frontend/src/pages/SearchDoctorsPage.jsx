import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchDoctors } from "../api"; // Assuming your AI call is separate for now
import toast from "react-hot-toast";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";
import Modal from "../components/Modal";
import axios from "axios"; // Keep for the separate AI call

const doctorSpecialties = ["Cardiologist", "Dermatologist", "Gynecologist", "Dentist", "Pediatrician", "General Physician", "Neurologist"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Patna", "Kolkata", "Chennai"];

const SearchDoctorsPage = () => {
    const [filters, setFilters] = useState({
        specialty: "", city: "", radius: "10", minExperience: "", maxExperience: "", sortBy: "rating_desc", skillKeyword: ""
    });
    const [doctors, setDoctors] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, totalDoctors: 0, limit: 10, hasNextPage: false, hasPrevPage: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const [showAIModal, setShowAIModal] = useState(false);
    const [symptomsInput, setSymptomsInput] = useState("");
    const [aiSuggestion, setAISuggestion] = useState("");
    const [aiReasoning, setAIReasoning] = useState("");
    const [aiLoading, setAILoading] = useState(false);

    const fetchDoctors = async (currentFilters, page = 1) => {
        setIsLoading(true);
        try {
            const queryParams = { ...currentFilters, page, limit: pagination.limit };
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === "" || queryParams[key] == null) delete queryParams[key];
            });

            const { data } = await searchDoctors(queryParams);

            if (data.doctors && data.pagination) {
                setDoctors(data.doctors);
                setPagination(data.pagination);
            } else {
                setDoctors(data.doctors || data);
                setPagination({ currentPage: 1, totalPages: 1, totalDoctors: data.doctors ? data.doctors.length : data.length, limit: 10, hasNextPage: false, hasPrevPage: false });
            }
        } catch (error) {
            toast.error("Failed to fetch doctors. Is the server running?");
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors({}, 1);
    }, []);

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchDoctors(filters, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchDoctors(filters, newPage);
        }
    };

    const findNearbyDoctors = () => {
        if (!navigator.geolocation) return toast.error("Geolocation is not supported.");
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                const geoFilters = { ...filters, lat: latitude, lng: longitude, radius: filters.radius || "10" };
                fetchDoctors(geoFilters, 1);
                setIsGettingLocation(false);
                toast.success(`Found doctors within ${filters.radius || "10"}km!`);
            },
            (error) => {
                setIsGettingLocation(false);
                toast.error("Unable to get your location. Please select a city manually.");
            }
        );
    };

    const clearLocationFilter = () => {
        setUserLocation(null);
        const clearedFilters = { ...filters };
        delete clearedFilters.lat;
        delete clearedFilters.lng;
        setFilters(clearedFilters);
        fetchDoctors(clearedFilters, 1);
        toast.success("Location filter cleared");
    };

    const handleAIModalOpen = () => setShowAIModal(true);
    const handleAIModalClose = () => {
        setShowAIModal(false);
        setSymptomsInput("");
        setAISuggestion("");
        setAIReasoning("");
    };

    const handleAISubmit = async () => {
        if (!symptomsInput.trim()) return toast.error("Please enter your symptoms.");
        setAILoading(true);
        try {
            // NOTE: This assumes your backend has an /api/ai/suggest-specialty route
            // And you have set up a proxy in vite.config.js or are using the full URL
            const { data } = await axios.post("https://docathome-backend.onrender.com/api/ai/suggest-specialty", { symptoms: symptomsInput });
            setAISuggestion(data.specialty);
            setAIReasoning(data.reasoning || "");
            setFilters(f => ({ ...f, specialty: data.specialty }));
        } catch (err) {
            toast.error("Could not get a suggestion. Try again.");
        } finally {
            setAILoading(false);
        }
    };

    return (
        <div>
            {/* Header, Main Content, and Filters Form */}
            <div className="relative bg-[url('/search-header-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Find Your Doctor</h1>
                </div>
            </div>

            <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <form onSubmit={handleApplyFilters} className="lg:col-span-1 bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Filters</h2>
                    
                    {/* All filter inputs go here... */}
                    <div className="mb-6">
                        <label className="block text-slate-700 dark:text-secondary-text mb-2 font-semibold">Specialty</label>
                        <div className="flex gap-2">
                            <select name="specialty" value={filters.specialty} onChange={handleFilterChange} className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700">
                                <option value="">All Specialties</option>
                                {doctorSpecialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                            </select>
                            <button type="button" className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 font-semibold" onClick={handleAIModalOpen}>Help</button>
                        </div>
                    </div>
                    {/* ... other filters like city, experience, etc. */}
                    
                    {/* THIS IS THE CORRECTLY PLACED VERIFIED SKILLS FILTER */}
                    <div className="mb-4">
                      <label htmlFor="skillKeyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    
                    <button type="submit" className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? "Searching..." : "Search Doctors"}
                    </button>
                </form>

                <main className="lg:col-span-3">
                    {/* Results Summary and Pagination */}
                    {/* ... */}
                    {isLoading ? (
                        <div className="space-y-6">
                            {[...Array(3)].map((_, idx) => <DoctorCardSkeleton key={idx} />)}
                        </div>
                    ) : doctors.length > 0 ? (
                        <div className="space-y-6">
                            {doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} />)}
                        </div>
                    ) : (
                        <div className="text-center bg-white dark:bg-secondary-dark p-10 rounded-lg">
                            <p className="text-black dark:text-secondary-text text-xl">No doctors found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
            
            {/* AI Modal */}
            <Modal isOpen={showAIModal} onClose={handleAIModalClose}>
                {/* ... Modal content ... */}
                <h2 className="text-xl font-bold">Describe your Symptoms</h2>
                <textarea value={symptomsInput} onChange={(e) => setSymptomsInput(e.target.value)} rows={4} className="w-full p-2 border rounded mt-4" placeholder="e.g., 'I have a persistent headache...'"></textarea>
                <button onClick={handleAISubmit} disabled={aiLoading} className="w-full bg-blue-600 text-white p-3 rounded mt-4">{aiLoading ? 'Analyzing...' : 'Get AI Recommendation'}</button>
                {aiSuggestion && <div><p>We recommend seeing a <strong>{aiSuggestion}</strong>.</p><p>{aiReasoning}</p></div>}
            </Modal>
        </div>
    );
};

// --- THIS IS THE CORRECTLY PLACED DOCTOR CARD COMPONENT ---
const DoctorCard = ({ doctor }) => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6">
        <img src="/doctor-avatar.jpg" alt={doctor.name} className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-gray-700" />
        <div className="flex-grow text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">{doctor.name}</h3>
            {doctor.subscriptionTier === "pro" && <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">⭐ PRO</span>}
            <p className="text-accent-blue font-semibold">{doctor.specialty}</p>
            <p className="text-secondary-text mt-1">{doctor.city}</p>
            {doctor.distance !== undefined && <p className="text-green-400 text-sm">📍 Approx. {doctor.distance}km away</p>}
            <div className="flex justify-center md:justify-start items-center gap-4 my-2 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded-full">{doctor.experience} Yrs Experience</span>
                <span className="text-yellow-400">{doctor.averageRating ? doctor.averageRating.toFixed(1) : "0.0"} ★ ({doctor.numReviews || 0} reviews)</span>
            </div>
            <p className="text-lg font-semibold text-white mt-2">Fee: <span className="text-accent-blue">₹2000</span></p>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center">
            <Link to={`/doctors/${doctor._id}`} className="bg-accent-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-blue-hover">
                View & Book
            </Link>
        </div>
    </div>
);

export default SearchDoctorsPage;