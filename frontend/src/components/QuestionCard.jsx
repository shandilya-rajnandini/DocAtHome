import React from "react";

const QuestionCard = ({ question, onAnswer }) => (
  <div className="bg-secondary-dark p-8 rounded-lg shadow-lg text-center animate-fade-in">
    <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      {question.options.map((option) => (
        <button
          key={option.value}
          onClick={() => onAnswer(option.value)}
          className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-6 rounded transition-transform transform hover:scale-105"
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export default QuestionCard;
