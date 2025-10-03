
// import { getMyProfile, updateMyProfile } from '../api';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, updateMyProfile, deleteMyProfile } from '../api';
import toast from 'react-hot-toast';
import ServiceAreaMap from '../components/ServiceAreaMap';
import { useNavigate } from 'react-router-dom';


// const DoctorEditProfilePage = () => {
//     const [profile, setProfile] = useState({ 
//         name: '', 
//         city: '', 
//         experience: '', 
//         qualifications: [], 
//         bio: '', 
//         profilePictureUrl: null, 
//         serviceArea: null,
//         isTwoFactorEnabled: false 
//     });
//     const [loading, setLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isDisabling2FA, setIsDisabling2FA] = useState(false);
//     const navigate = useNavigate();
//     const [showDeactivateModal, setShowDeactivateModal] = useState(false);
//     const [isDeactivating, setIsDeactivating] = useState(false);

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const { data } = await getMyProfile();
//                 setProfile({
//                     name: data.name || '',
//                     city: data.city || '',
//                     experience: data.experience || '',
//                     qualifications: data.qualifications || [],
//                     bio: data.bio || '',
//                     profilePictureUrl: data.profilePictureUrl || '',
//                     serviceArea: data.serviceArea || null,
//                     isTwoFactorEnabled: data.isTwoFactorEnabled || false,
//                 });
//             // eslint-disable-next-line no-unused-vars
//             } catch (error) {
//                 toast.error("Could not load your profile.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProfile();
//     }, []);

//     const onChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

//     const disable2FA = async () => {
//         setIsDisabling2FA(true);
//         try {
//             const response = await fetch('http://localhost:5000/api/twofactor/disable', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });
            
//             if (response.ok) {
//                 setProfile({ ...profile, isTwoFactorEnabled: false });
//                 toast.success('2FA has been disabled successfully');
//             } else {
//                 const errorData = await response.json();
//                 toast.error(errorData.message || 'Failed to disable 2FA');
//             }
//         } catch (error) {
//             toast.error('Failed to disable 2FA');
//             console.error('2FA disable error:', error);
//         } finally {
//             setIsDisabling2FA(false);
//         }
//     };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', 'your_upload_preset'); // replace with your actual preset

//     toast.loading("Uploading image...");
//     try {
//         const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
//             method: 'POST',
//             body: formData
//         });

//         const data = await res.json();
//         if (data.secure_url) {
//             setProfile({ ...profile, profilePictureUrl: data.secure_url });
//             toast.dismiss(); // remove loading
//             toast.success("Image uploaded successfully!");
//         } else {
//             throw new Error("Upload failed");
//         }
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//         toast.dismiss();
//         toast.error("Image upload failed.");
//     }
// };

//  const onSubmit = async (e) => {
//     e.preventDefault();
//     setIsSaving(true);
    
//     try {
//         const profileData = {
//             ...profile,
//             qualifications: profile.qualifications.join(', '),
//             profilePictureUrl: profile.profilePictureUrl || '',
//             // Send serviceArea as-is (object); API supports JSON or string
//             serviceArea: profile.serviceArea || null,
//         };

//         const { data } = await updateMyProfile(profileData);
        
//         // Update the profile state with the returned data to ensure consistency
//         setProfile(prev => ({
//             ...prev,
//             serviceArea: data.serviceArea || null,
//         }));
        
//         toast.success("Profile updated successfully!");
//     // eslint-disable-next-line no-unused-vars
//     } catch (error) {
//         toast.error("Failed to update profile.");
//     } finally {
//         setIsSaving(false);
//     }
// };


//     if (loading) return <div className="text-center p-10 text-white">Loading your profile...</div>;

//     return (
//         <div>
//             <div className="relative bg-[url('/edit-profile-bg.jpg')] bg-cover bg-center h-60">
//                 <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
//                     <h1 className="text-5xl font-bold text-white">Edit Your Profile</h1>
//                 </div>
//             </div>
//             <div className="container mx-auto p-8">
//                 <form onSubmit={onSubmit} className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
//                     <div className="flex flex-col items-center mb-8">
//                         <img src={profile.profilePictureUrl || "/doctor-avatar.jpg"} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-accent-blue" />
//                         <label htmlFor="profile-picture-upload" className="mt-4 bg-accent-blue text-white font-bold py-2 px-4 rounded cursor-pointer hover:bg-accent-blue-hover">Upload New Picture</label>
//                         <input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
//                     </div>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div><label className="block text-secondary-text mb-2">Full Name</label><input type="text" name="name" value={profile.name} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
//                         <div><label className="block text-secondary-text mb-2">City</label><input type="text" name="city" value={profile.city} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
//                         <div><label className="block text-secondary-text mb-2">Experience (Years)</label><input type="number" name="experience" value={profile.experience} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
//                         <div><label className="block text-secondary-text mb-2">Qualifications (comma-separated)</label><input type="text" name="qualifications" value={profile.qualifications.join(', ')} onChange={(e) =>
//   setProfile({ ...profile, qualifications: e.target.value.split(',').map(q => q.trim()) })
// } placeholder="e.g., MBBS, MD Cardiology" className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white" /></div>
//                         <div className="md:col-span-2"><label className="block text-secondary-text mb-2">Professional Bio</label><textarea name="bio" value={profile.bio} onChange={onChange} rows="5" placeholder="Tell patients about yourself..." className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"></textarea></div>
//                                                 <div className="md:col-span-2">
//                           <label className="block text-secondary-text mb-2">Service Area</label>
//                           <p className="text-sm text-secondary-text mb-2">Draw a polygon showing where you provide in-person service. Changes persist after saving.</p>
//                           <ServiceAreaMap value={profile.serviceArea} onChange={(geo) => setProfile({ ...profile, serviceArea: geo })} />
//                                                 </div>
//                     </div>
//                 <div className="flex items-center justify-between mt-8"> 
//                     <div className="space-x-4">
//                         {profile.isTwoFactorEnabled ? (
//                             <button
//                                 type="button"
//                                 onClick={disable2FA}
//                                 disabled={isDisabling2FA}
//                                 className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded transition"
//                             >
//                                 {isDisabling2FA ? 'Disabling...' : 'Disable Two-Factor Authentication'}
//                             </button>
//                         ) : (
//                             <Link 
//                                 to="/2fa-setup" 
//                                 className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-4 rounded inline-block"
//                             >
//                                 Enable Two-Factor Authentication
//                             </Link>
//                         )}
//                     </div>
//                     <button
//                         type="submit"
//                         disabled={isSaving}
//                         className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-lg transition"
//                     >
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//                 </form>
//             </div>
//             <div className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg mt-8">
//                 <h2 className="text-xl font-bold text-red-500 mb-4">Deactivate Account</h2>
//                 <p className="mb-4 text-secondary-text">Deactivating your account will disable your access. This action cannot be undone.</p>
//                 <button
//                     type="button"
//                     className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//                     onClick={() => setShowDeactivateModal(true)}
//                 >
//                     Deactivate Account
//                 </button>
//             </div>
//             {showDeactivateModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
//                         <h3 className="text-lg font-bold mb-4 text-red-600">Are you sure?</h3>
//                         <p className="mb-6">This action cannot be undone. Your account will be deactivated and you will be logged out.</p>
//                         <div className="flex justify-end space-x-4">
//                             <button
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//                                 onClick={() => setShowDeactivateModal(false)}
//                                 disabled={isDeactivating}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//                                 onClick={handleDeactivate}
//                                 disabled={isDeactivating}
//                             >
//                                 {isDeactivating ? 'Deactivating...' : 'Confirm'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
// export default DoctorEditProfilePage;


//                 <div className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg mt-8">
//                 </div>

//     const handleDeactivate = async () => {
//         setIsDeactivating(true);
//         try {
//             const response = await fetch('http://localhost:5000/api/profile/me', {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });
//             if (response.ok) {
//                 toast.success('Account deactivated.');
//                 localStorage.clear();
//                 navigate('/login');
//             } else {
//                 const errorData = await response.json();
//                 toast.error(errorData.message || 'Failed to deactivate account');
//             }
//         } catch (error) {
//             toast.error('Failed to deactivate account');
//         } finally {
//             setIsDeactivating(false);
//             setShowDeactivateModal(false);
//         }
//     };



import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Assuming getMyProfile and updateMyProfile handle the new profileStatus field
import { getMyProfile, updateMyProfile } from "../api";
import toast from "react-hot-toast";
import ServiceAreaMap from "../components/ServiceAreaMap";
import { useNavigate } from "react-router-dom";

const DoctorEditProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    city: "",
    experience: "",
    qualifications: [],
    bio: "",
    profilePictureUrl: null,
    serviceArea: null,
    isTwoFactorEnabled: false,
    // 1. ADD NEW STATE FIELD
    profileStatus: "Draft",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const navigate = useNavigate();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setProfile({
          name: data.name || "",
          city: data.city || "",
          experience: data.experience || "",
          qualifications: data.qualifications || [],
          bio: data.bio || "",
          profilePictureUrl: data.profilePictureUrl || "",
          serviceArea: data.serviceArea || null,
          isTwoFactorEnabled: data.isTwoFactorEnabled || false,
          // 2. FETCH AND SET profileStatus
          profileStatus: data.profileStatus || "Draft",
        });
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  // Existing functions... (handleFileChange, disable2FA, handleDeactivate, etc. remain the same)

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // replace with your actual preset

    toast.loading("Uploading image...");
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        setProfile({ ...profile, profilePictureUrl: data.secure_url });
        toast.dismiss(); // remove loading
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.dismiss();
      toast.error("Image upload failed.");
    }
  };

  // 3. NEW Save/Publish Handler
  const handleSaveProfile = async (status, e) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from a button
    setIsSaving(true);

    try {
      const profileData = {
        ...profile,
        qualifications: profile.qualifications.join(", "),
        profilePictureUrl: profile.profilePictureUrl || "",
        serviceArea: profile.serviceArea || null,
        // Pass the status determined by the button press
        profileStatus: status,
      };

      const { data } = await updateMyProfile(profileData);

      // Update the local profile state with the returned data and new status
      setProfile((prev) => ({
        ...prev,
        serviceArea: data.serviceArea || null,
        profileStatus: data.profileStatus, // Use status from response
      }));

      if (status === "Published") {
        toast.success("Profile Published successfully! It is now visible.");
      } else {
        toast.success("Draft saved successfully!");
      }

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(
        `Failed to ${status === "Published" ? "publish" : "save"} profile.`
      );
    } finally {
      setIsSaving(false);
    }
  };


  // Replace the old onSubmit with explicit Save Draft/Publish calls
  // Note: The form's onSubmit event should be removed or changed to point to handleSaveDraft
  const handleSaveDraft = (e) => handleSaveProfile("Draft", e);
  const handlePublishProfile = (e) => handleSaveProfile("Published", e);

  const handleDeactivate = async () => {
        setIsDeactivating(true);
        try {
            await deleteMyProfile();
            toast.success('Account deactivated.');
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to deactivate account');
        } finally {
            setIsDeactivating(false);
            setShowDeactivateModal(false);
        }
    };


  // 4. Deactivate logic (copied from the end of your original file)
  const disable2FA = async () => {
    /* ... existing implementation ... */
  };
  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        toast.success("Account deactivated.");
        localStorage.clear();
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to deactivate account");
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 text-white">Loading your profile...</div>
    );

  return (
    <div>
      <div className="relative bg-[url('/edit-profile-bg.jpg')] bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white">Edit Your Profile</h1>
        </div>
      </div>
      <div className="container mx-auto p-8">
        {/* 5. VISUAL INDICATOR */}
        <div
          className={`max-w-4xl mx-auto p-4 mb-8 rounded-lg text-center font-bold shadow-lg
                    ${
                      profile.profileStatus === "Draft"
                        ? "bg-yellow-800 text-yellow-100 border border-yellow-700"
                        : "bg-green-800 text-green-100 border border-green-700"
                    }`}
        >
          {profile.profileStatus === "Draft" ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Draft Mode: Profile is **NOT** publicly visible.
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Profile **Published**: Visible to patients.
            </span>
          )}
        </div>

        <form className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
          {/* Form content (Picture, Inputs, Map) remains the same */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={profile.profilePictureUrl || "/doctor-avatar.jpg"}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-accent-blue"
            />
            <label
              htmlFor="profile-picture-upload"
              className="mt-4 bg-accent-blue text-white font-bold py-2 px-4 rounded cursor-pointer hover:bg-accent-blue-hover"
            >
              Upload New Picture
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-secondary-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={onChange}
                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-secondary-text mb-2">City</label>
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={onChange}
                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-secondary-text mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                value={profile.experience}
                onChange={onChange}
                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-secondary-text mb-2">
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                name="qualifications"
                value={profile.qualifications.join(", ")}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    qualifications: e.target.value
                      .split(",")
                      .map((q) => q.trim()),
                  })
                }
                placeholder="e.g., MBBS, MD Cardiology"
                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-secondary-text mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={onChange}
                rows="5"
                placeholder="Tell patients about yourself..."
                className="w-full p-3 bg-primary-dark rounded border-gray-700 text-white"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-secondary-text mb-2">
                Service Area
              </label>
              <p className="text-sm text-secondary-text mb-2">
                Draw a polygon showing where you provide in-person service.
                Changes persist after saving.
              </p>
              <ServiceAreaMap
                value={profile.serviceArea}
                onChange={(geo) => setProfile({ ...profile, serviceArea: geo })}
              />
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
                  {isDisabling2FA
                    ? "Disabling..."
                    : "Disable Two-Factor Authentication"}
                </button>
              ) : (
                <Link
                  to="/2fa-setup"
                  className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-4 rounded inline-block"
                >
                  Enable Two-Factor Authentication
                </Link>
              )}
            </div>


            {/* 6. NEW BUTTONS: Save Draft and Publish Profile */}
            <div className="space-x-4">
              {/* Save Draft Button (replaces the old 'Save Changes' submit button) */}
              <button
                type="button" // Important: change to type="button" to prevent default form submission
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {isSaving ? "Saving Draft..." : "Save Draft"}
              </button>

              {/* Publish Profile Button (new) */}
              <button
                type="button"
                onClick={handlePublishProfile}
                disabled={isSaving} // Disable if saving any type
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {isSaving ? "Saving & Publishing..." : "Publish Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Account Deactivation section remains the same */}
      <div className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Deactivate Account
        </h2>
        <p className="mb-4 text-secondary-text">
          Deactivating your account will disable your access. This action cannot
          be undone.
        </p>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowDeactivateModal(true)}
        >
          Deactivate Account
        </button>
      </div>
      {/* Deactivation Modal remains the same */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-red-600">
              Are you sure?
            </h3>
            <p className="mb-6">
              This action cannot be undone. Your account will be deactivated and
              you will be logged out.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? "Deactivating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};
export default DoctorEditProfilePage;