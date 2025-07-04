import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../api';
import toast from 'react-hot-toast';

const DoctorEditProfilePage = () => {
    const [profile, setProfile] = useState({ name: '', city: '', experience: '', qualifications: [], bio: '', profilePicture: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getMyProfile();
                setProfile({
                    name: data.name || '',
                    city: data.city || '',
                    experience: data.experience || '',
                    qualifications: data.qualifications || [],
                    bio: data.bio || '',
                });
            } catch (error) {
                toast.error("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const onChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setProfile({ ...profile, profilePicture: URL.createObjectURL(e.target.files[0]) });
            toast.success("Profile picture selected. Click 'Save Changes' to apply.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const profileData = { ...profile, qualifications: profile.qualifications.join(', ') };
            await updateMyProfile(profileData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading your profile...</div>;

    return (
        <div>
            <div className="relative bg-[url('/edit-profile-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Edit Your Profile</h1>
                </div>
            </div>
            <div className="container mx-auto p-8">
                <form onSubmit={onSubmit} className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center mb-8">
                        <img src={profile.profilePicture || "/doctor-avatar.jpg"} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-accent-blue" />
                        <label htmlFor="profile-picture-upload" className="mt-4 bg-accent-blue text-white font-bold py-2 px-4 rounded cursor-pointer hover:bg-accent-blue-hover">Upload New Picture</label>
                        <input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-secondary-text mb-2">Full Name</label><input type="text" name="name" value={profile.name} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
                        <div><label className="block text-secondary-text mb-2">City</label><input type="text" name="city" value={profile.city} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
                        <div><label className="block text-secondary-text mb-2">Experience (Years)</label><input type="number" name="experience" value={profile.experience} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
                        <div><label className="block text-secondary-text mb-2">Qualifications (comma-separated)</label><input type="text" name="qualifications" value={profile.qualifications.join(', ')} onChange={onChange} placeholder="e.g., MBBS, MD Cardiology" className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
                        <div className="md:col-span-2"><label className="block text-secondary-text mb-2">Professional Bio</label><textarea name="bio" value={profile.bio} onChange={onChange} rows="5" placeholder="Tell patients about yourself..." className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"></textarea></div>
                    </div>
                    <div className="text-right mt-8"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">Save Changes</button></div>
                </form>
            </div>
        </div>
    );
};
export default DoctorEditProfilePage;