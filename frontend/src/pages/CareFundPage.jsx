import React, { useState, useEffect } from 'react';
import { getMyCareFund } from '../api';
import toast from 'react-hot-toast';

const CareFundPage = () => {
    const [fund, setFund] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFund = async () => {
            try {
                const { data } = await getMyCareFund();
                setFund(data);
            } catch {
                toast.error("Could not load your Care Fund details.");
            } finally {
                setLoading(false);
            }
        };
        fetchFund();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>My Care Fund</h1>
            <p>Current Balance: ₹{fund?.careFundBalance || 0}</p>
            {/* Future: donation form, history, etc. */}
        </div>
    );
};

export default CareFundPage;