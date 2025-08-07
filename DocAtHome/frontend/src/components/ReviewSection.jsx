import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReviewsForDoctor, createReview } from '../api';
import toast from 'react-hot-toast';

const ReviewSection = ({ doctorId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const fetchReviews = async () => {
        try {
            const { data } = await getReviewsForDoctor(doctorId);
            setReviews(data.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [doctorId]);
    
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0 || !comment) {
            return toast.error("Please provide a rating and a comment.");
        }
        try {
            await createReview(doctorId, { rating, comment });
            toast.success("Review submitted successfully!");
            // Reset form and refetch reviews
            setRating(0);
            setComment('');
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to submit review.");
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Patient Reviews</h3>
            
            {/* Review Submission Form (only for logged-in patients) */}
            {user && user.role === 'patient' && (
                <form onSubmit={handleSubmitReview} className="bg-secondary-dark p-6 rounded-lg mb-8">
                    <h4 className="text-xl text-accent-blue mb-3">Leave a Review</h4>
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">Your Rating</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setRating(star)}
                                    className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">Your Comment</label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 bg-primary-dark rounded border-gray-700 h-24"
                            placeholder="Share your experience..."></textarea>
                    </div>
                    <button type="submit" className="bg-accent-blue text-white py-2 px-6 rounded font-bold">Submit Review</button>
                </form>
            )}

            {/* Display Reviews */}
            <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                    <div key={review._id} className="bg-secondary-dark p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-white">{review.patient.name}</p>
                            <div className="flex text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                                {[...Array(5 - review.rating)].map((_, i) => <span key={i} className="text-gray-600">★</span>)}
                            </div>
                        </div>
                        <p className="text-primary-text mt-2">{review.comment}</p>
                    </div>
                )) : <p className="text-secondary-text">No reviews yet. Be the first to leave one!</p>}
            </div>
        </div>
    );
};

export default ReviewSection;