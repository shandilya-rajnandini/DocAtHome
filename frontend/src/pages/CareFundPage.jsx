import React, { useEffect, useState, useCallback } from "react";
import API from '../api';
import toast from 'react-hot-toast';
import useAthStore from "../store/useAuthStore";

const CareFundPage = () => {
  
  const { user } = useAthStore();

  const [balance, setBalance] = useState(0);
  const [donations, setDonations] = useState([]);
  const [shareLink, setShareLink] = useState("");

  const fetchCareFundData = useCallback(() => {
    if (user) {
      const toastId = toast.loading('Fetching data...');
      // Fetch care fund balance
      API.get(`/profile/${user._id}`)
        .then(res => setBalance(res.data.careFundBalance || 0));
      // Fetch donations
      API.get(`/payment/donations?patientId=${user._id}`)
        .then(res => {
            setDonations(Array.isArray(res.data) ? res.data : []);
            toast.success('Data updated!', { id: toastId });
        })
        .catch(() => toast.error('Could not fetch donations.', { id: toastId }));
      // Generate shareable link
      setShareLink(`${window.location.origin}/care-fund/${user._id}`);
    }
  }, [user]);

  useEffect(() => {
    fetchCareFundData();
  }, [fetchCareFundData]);

  return (
    <div className="bg-primary-dark py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-secondary-dark p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-white">Care Fund</h2>
            <button
                onClick={fetchCareFundData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Refresh
            </button>
          </div>
          <div className="mb-6 bg-primary-dark p-4 rounded-lg">
            <span className="font-semibold text-secondary-text text-lg">Balance:</span>
            <span className="text-3xl font-bold text-accent-blue ml-4">₹{balance}</span>
          </div>
          <div className="mb-8">
            <label className="font-semibold text-secondary-text text-lg mb-2 block">Shareable Link:</label>
            <div className="flex">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="p-3 bg-primary-dark border border-gray-700 rounded-l-md w-full text-white"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success('Link copied to clipboard!');
                }}
                className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-4 rounded-r-md"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Recent Donations</h3>
            <ul className="space-y-3">
              {donations.length === 0 ? (
                <li className="text-secondary-text bg-primary-dark p-4 rounded-md">No donations yet.</li>
              ) : (
                donations.map(d => (
                  <li key={d._id} className="bg-primary-dark p-4 rounded-md flex justify-between items-center">
                    <span className="text-white font-semibold">{d.donorName}</span>
                    <span className="text-green-400 font-bold text-lg">donated ₹{d.amount}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareFundPage;
