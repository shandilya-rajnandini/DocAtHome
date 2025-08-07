import React from 'react';
import { Link } from 'react-router-dom';

const RecommendationCard = ({ recommendation }) => (
  <div className="bg-secondary-dark p-8 rounded-lg shadow-lg text-center animate-fade-in">
    <h2 className="text-2xl font-bold text-white mb-4">Our Recommendation:</h2>
    <p className="text-accent-blue text-3xl font-bold mb-6">{recommendation.title}</p>
    <p className="text-secondary-text mb-6">{recommendation.description}</p>
    {recommendation.link ? (
      <Link
        to={recommendation.link}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded text-lg transition-transform transform hover:scale-105 inline-block"
      >
        {recommendation.linkText}
      </Link>
    ) : (
      <div className="bg-red-600 text-white font-bold py-3 px-8 rounded text-lg">
        {recommendation.linkText}
      </div>
    )}
  </div>
);

export default RecommendationCard;
