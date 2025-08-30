import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProfileById, updateProfile } from '../api';
import toast from 'react-hot-toast';

const AdminEditProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState({ 
        name: '', 
        email: '', 
        profilePictureUrl: null,
        isTwoFactorEnabled: false,
        verifiedSkills: [],
        role: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getProfileById(userId);
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    profilePictureUrl: data.profilePictureUrl || '',
                    isTwoFactorEnabled: data.isTwoFactorEnabled || false,
                    verifiedSkills: data.verifiedSkills || [],
                    role: data.role || ''
                });
            } catch (error) {
                console.log(error);
                toast.error("Could not load the profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const onChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setProfile({
                ...profile,
                verifiedSkills: [...profile.verifiedSkills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile({
            ...profile,
            verifiedSkills: profile.verifiedSkills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'your_upload_preset');

        toast.loading("Uploading image...");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.secure_url) {
                setProfile({ ...profile, profilePictureUrl: data.secure_url });
                toast.dismiss();
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            console.log(err);
            toast.dismiss();
            toast.error("Image upload failed.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const profileData = {
                ...profile,
                profilePictureUrl: profile.profilePictureUrl || '',
            };

            await updateProfile(userId, profileData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading profile...</div>;

    return (
        <div>
            <div className="relative bg-gradient-to-r from-blue-800 to-blue-900 h-60">
                <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Edit Professional Profile</h1>
                </div>
            </div>
            <div className="container mx-auto p-8">
                <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center mb-8">
                        <img src={profile.profilePictureUrl || "/doctor-avatar.jpg"} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-blue-500" />
                        <label htmlFor="profile-picture-upload" className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer hover:bg-blue-700">Upload New Picture</label>
                        <input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-secondary-text mb-2">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={profile.name} 
                                onChange={onChange} 
                                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-secondary-text mb-2">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={profile.email} 
                                onChange={onChange} 
                                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" 
                                disabled
                                title="Email cannot be changed"
                            />
                            <p className="text-sm text-gray-400 mt-1">Email address cannot be modified</p>
                        </div>
                        {(profile.role === 'doctor' || profile.role === 'nurse') && (
                            <div>
                                <label className="block text-secondary-text mb-2">Verified Skills</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Enter a skill to verify"
                                        className="flex-1 p-3 bg-primary-dark rounded border-gray-700 text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Add Skill
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.verifiedSkills.map((skill, index) => (
                                        <div key={index} className="flex items-center bg-blue-600 text-white px-3 py-1 rounded">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="ml-2 text-white hover:text-red-300"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end mt-8">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            Save Changes
                        </button> 
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditProfilePage;