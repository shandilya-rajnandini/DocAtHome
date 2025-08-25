import React, { useState } from "react";
import QuestionCard from "../components/QuestionCard";
import RecommendationCard from "../components/RecommendationCard";

const questions = {
  start: {
    text: "Is this a life-threatening emergency?",
    options: [
      { label: "Yes", value: "recommend_emergency" },
      { label: "No", value: "symptom_type" },
    ],
  },
  symptom_type: {
    text: "What is the primary nature of your health concern?",
    options: [
      { label: "A new physical symptom or illness", value: "physical_new" },
      { label: "Managing an ongoing condition", value: "physical_chronic" },
      {
        label: "Mental or emotional health support",
        value: "recommend_doctor_mental",
      },
      { label: "Help with daily activities or recovery", value: "daily_care" },
    ],
  },
  physical_new: {
    text: "Do you believe you need a medical diagnosis or a new prescription?",
    options: [
      { label: "Yes", value: "recommend_doctor" },
      { label: "No / Not Sure", value: "recommend_doctor_checkup" },
    ],
  },
  physical_chronic: {
    text: "What kind of help do you need for your ongoing condition?",
    options: [
      {
        label: "Medication management or wound care",
        value: "recommend_nurse",
      },
      { label: "Adjusting my treatment plan", value: "recommend_doctor" },
    ],
  },
  daily_care: {
    text: "What is the main focus of the daily care needed?",
    options: [
      { label: "Post-operative recovery care", value: "recommend_nurse" },
      { label: "Help with mobility or bathing", value: "recommend_caregiver" },
    ],
  },
};

const recommendations = {
  emergency: {
    title: "Emergency Services",
    description:
      "For life-threatening emergencies, please call your local emergency number immediately.",
    link: null,
    linkText: "Call 112 Immediately",
  },
  doctor: {
    title: "Find a Doctor",
    description:
      "A doctor can provide a diagnosis, prescribe medication, and create a treatment plan for a new condition.",
    link: "/search",
    linkText: "Find a Doctor Now",
  },
  doctor_checkup: {
    title: "Find a Doctor",
    description:
      "It's always best to consult a doctor for new symptoms, even if you're unsure. They can provide an accurate diagnosis and peace of mind.",
    link: "/search",
    linkText: "Find a Doctor Now",
  },
  doctor_mental: {
    title: "Find a Doctor",
    description:
      "For mental or emotional health, a consultation with a doctor or psychiatrist is the best first step. They can provide a diagnosis and guide you to the right therapist or treatment.",
    link: "/search",
    linkText: "Find a Doctor Now",
  },
  nurse: {
    title: "Find a Nurse",
    description:
      "A nurse is ideal for managing existing conditions, providing post-operative care, and administering treatments prescribed by a doctor.",
    link: "/search-nurses",
    linkText: "Find a Nurse Now",
  },
  caregiver: {
    title: "Find a Caregiver",
    description:
      "A caregiver can assist with daily living activities, provide companionship, and help with mobility. This feature is coming soon!",
    link: null,
    linkText: "Coming Soon",
  },
};

const CareNavigatorPage = () => {
  const [currentQuestionKey, setCurrentQuestionKey] = useState("start");
  const [recommendation, setRecommendation] = useState(null);

  const handleAnswer = (answer) => {
    if (answer.startsWith("recommend_")) {
      const recommendationKey = answer.replace("recommend_", "");
      setRecommendation(recommendations[recommendationKey]);
    } else {
      setCurrentQuestionKey(answer);
    }
  };

  const handleReset = () => {
    setCurrentQuestionKey("start");
    setRecommendation(null);
  };

  return (
    <div className="bg-primary-dark min-h-screen flex flex-col justify-center items-center text-white p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8">Care Navigator</h1>
        {!recommendation && (
          <p className="text-center text-secondary-text mb-8">
            Answer a few simple questions to find the right care for your needs.
          </p>
        )}

        {recommendation ? (
          <div className="flex flex-col items-center">
            <RecommendationCard recommendation={recommendation} />
            <button
              onClick={handleReset}
              className="mt-8 text-accent-blue hover:underline"
            >
              Start Over
            </button>
          </div>
        ) : (
          <QuestionCard
            question={questions[currentQuestionKey]}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default CareNavigatorPage;
