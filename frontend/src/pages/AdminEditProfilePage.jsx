import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../api';
import toast from 'react-hot-toast';

const AdminEditProfilePage = () => {
    const [profile, setProfile] = useState({ 
        name: '', 
        email: '', 
        profilePictureUrl: null,
        isTwoFactorEnabled: false 
    });
    const [loading, setLoading] = useState(true);
    const [isDisabling2FA, setIsDisabling2FA] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getMyProfile();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    profilePictureUrl: data.profilePictureUrl || '',
                    isTwoFactorEnabled: data.isTwoFactorEnabled || false,
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

    const disable2FA = async () => {
        setIsDisabling2FA(true);
        try {
            const response = await fetch('http://localhost:5000/api/twofactor/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                setProfile({ ...profile, isTwoFactorEnabled: false });
                toast.success('2FA has been disabled successfully');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to disable 2FA');
            }
        } catch (error) {
            toast.error('Failed to disable 2FA');
            console.error('2FA disable error:', error);
        } finally {
            setIsDisabling2FA(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'your_upload_preset'); // replace with your actual preset

        toast.loading("Uploading image...");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.secure_url) {
                setProfile({ ...profile, profilePictureUrl: data.secure_url });
                toast.dismiss(); // remove loading
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
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

            await updateMyProfile(profileData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading your profile...</div>;

    return (
        <div>
            <div className="relative bg-gradient-to-r from-blue-800 to-blue-900 h-60">
                <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">Admin Profile Settings</h1>
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
                    </div>
                    <div className="flex items-center justify-between mt-8"> 
                        <div className="space-x-4">
                            {profile.isTwoFactorEnabled ? (
                                <button
                                    type="button"
                                    onClick={disable2FA}
                                    disabled={isDisabling2FA}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded transition"
                                >
                                    {isDisabling2FA ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                                </button>
                            ) : (
                                <Link 
                                    to="/2fa-setup" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
                                >
                                    Enable Two-Factor Authentication
                                </Link>
                            )}
                        </div>
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
