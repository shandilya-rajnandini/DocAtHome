import React, { useState } from 'react';

const SymptomBodyMap = ({ onSymptomsSelected }) => {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const bodyParts = {
    head: {
      name: 'Head',
      symptoms: ['Headache', 'Dizziness', 'Vision problems', 'Ear pain', 'Sore throat', 'Nosebleed', 'Facial pain']
    },
    chest: {
      name: 'Chest',
      symptoms: ['Chest pain', 'Shortness of breath', 'Cough', 'Heart palpitations', 'Wheezing', 'Sore chest']
    },
    abdomen: {
      name: 'Abdomen',
      symptoms: ['Abdominal pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Bloating', 'Indigestion']
    },
    arms: {
      name: 'Arms',
      symptoms: ['Arm pain', 'Weakness', 'Numbness', 'Tingling', 'Swelling', 'Joint pain']
    },
    legs: {
      name: 'Legs',
      symptoms: ['Leg pain', 'Weakness', 'Numbness', 'Swelling', 'Joint pain', 'Cramps', 'Varicose veins']
    },
    back: {
      name: 'Back',
      symptoms: ['Back pain', 'Lower back pain', 'Stiffness', 'Muscle spasms', 'Sciatica']
    }
  };

  const handleBodyPartClick = (part) => {
    setSelectedBodyPart(part);
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length > 0) {
      onSymptomsSelected(selectedSymptoms.join(', '));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Select Your Symptoms
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
        Click on the body part where you're experiencing symptoms
      </p>

      {selectedSymptoms.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Selected Symptoms:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map(symptom => (
              <span key={symptom} className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Human Body Diagram */}
        <div className="flex-1 flex justify-center">
          <svg
            viewBox="0 0 200 400"
            className="w-full max-w-xs h-auto border rounded-lg bg-gray-50 dark:bg-gray-800 p-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <ellipse
              cx="100"
              cy="40"
              rx="25"
              ry="30"
              fill={selectedBodyPart === 'head' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('head')}
            />
            <text x="100" y="45" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Head</text>

            {/* Torso */}
            <rect
              x="75"
              y="70"
              width="50"
              height="80"
              rx="10"
              fill="#E5E7EB"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Chest area */}
            <rect
              x="75"
              y="70"
              width="50"
              height="40"
              rx="10"
              fill={selectedBodyPart === 'chest' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('chest')}
            />
            <text x="100" y="90" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Chest</text>

            {/* Abdomen area */}
            <rect
              x="75"
              y="110"
              width="50"
              height="40"
              rx="10"
              fill={selectedBodyPart === 'abdomen' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('abdomen')}
            />
            <text x="100" y="130" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Abdomen</text>

            {/* Left Arm */}
            <rect
              x="50"
              y="80"
              width="25"
              height="60"
              rx="12"
              fill={selectedBodyPart === 'arms' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('arms')}
            />
            <text x="62" y="110" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Arms</text>

            {/* Right Arm */}
            <rect
              x="125"
              y="80"
              width="25"
              height="60"
              rx="12"
              fill={selectedBodyPart === 'arms' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('arms')}
            />

            {/* Left Leg */}
            <rect
              x="80"
              y="150"
              width="20"
              height="80"
              rx="10"
              fill={selectedBodyPart === 'legs' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('legs')}
            />
            <text x="90" y="190" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Legs</text>

            {/* Right Leg */}
            <rect
              x="100"
              y="150"
              width="20"
              height="80"
              rx="10"
              fill={selectedBodyPart === 'legs' ? '#3B82F6' : '#E5E7EB'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('legs')}
            />

            {/* Back area */}
            <rect
              x="75"
              y="70"
              width="50"
              height="80"
              rx="10"
              fill="transparent"
              stroke="transparent"
              className="cursor-pointer"
              onClick={() => handleBodyPartClick('back')}
            />
            <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none opacity-50">Back</text>
          </svg>
        </div>

        {/* Symptoms Selection */}
        <div className="flex-1">
          {selectedBodyPart ? (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Symptoms in {bodyParts[selectedBodyPart].name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {bodyParts[selectedBodyPart].symptoms.map((symptom) => (
                  <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{symptom}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedSymptoms.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Get AI Recommendation ({selectedSymptoms.length} symptoms selected)
              </button>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedBodyPart(null);
                    setSelectedSymptoms([]);
                  }}
                  className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p className="text-lg">Click on a body part to select symptoms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomBodyMap;