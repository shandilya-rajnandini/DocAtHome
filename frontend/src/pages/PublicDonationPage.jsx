import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

// Public Donation Page - Allows anonymous donations to patient care funds
// Sends donation metadata (isDonation: true, patientId, donorName) to backend
// Backend creates orders with proper context for verification
const PublicDonationPage = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const { data } = await API.get(`/profile/${patientId}`);
                setPatient(data);
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                toast.error('Could not fetch patient details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [patientId]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handleDonate = async () => {
        if (!amount || !donorName) {
            return toast.error('Please enter your name and an amount.');
        }

        if (!patientId) {
            return toast.error('Patient ID is missing. Please refresh the page and try again.');
        }

        const numericAmount = parseFloat(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return toast.error('Please enter a valid amount greater than zero.');
        }
        // Convert to paise for Razorpay and storage; avoids floating point issues
        const amountPaise = Math.round(numericAmount * 100);

        const toastId = toast.loading('Processing your donation...');

        const res = await loadRazorpayScript();
        if (!res) {
            toast.error('Failed to load Razorpay. Please check your internet connection.', { id: toastId });
            return;
        }

        try {
            // Create order with donation metadata so backend can set proper context
            const { data: { id: order_id } } = await API.post('/payment/create-order', { 
                amount, 
                isDonation: true, 
                patientId, 
                donorName 
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amountPaise,
                currency: 'INR',
                name: 'Doc@Home Care Fund',
                description: `Donation for ${patient.name}`,
                order_id,
                handler: async (response) => {
                    await API.post('/payment/verify', {
                        ...response,
                        isDonation: true,
                        donorName,
                        patientId,
                        amount: numericAmount,
                    });
                    toast.success('Donation successful!', { id: toastId });
                    setAmount('');
                    setDonorName('');
                },
                prefill: {
                    name: donorName,
                },
                theme: {
                    color: '#3399cc',
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Donation failed:', error);
            toast.error('Something went wrong.', { id: toastId });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!patient) return <div>Patient not found.</div>;

    return (
        <div className="max-w-md mx-auto m-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Donate to {patient.name}'s Care Fund</h2>
            <div className="mb-4">
                <label className="block text-gray-700">Your Name</label>
                <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full p-2 border rounded text-gray-700"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Amount (INR)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    placeholder="Enter amount in rupees"
                    className="w-full p-2 border rounded text-gray-700"
                />
                <p className="text-sm text-gray-500 mt-1">Minimum: ₹1, Maximum: ₹1,00,00,000</p>
            </div>
            <button
                onClick={handleDonate}
                className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
            >
                Donate Now
            </button>
        </div>
    );
};

export default PublicDonationPage;
