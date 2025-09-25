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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Body Diagram */}
        <div className="flex-shrink-0">
          <svg
            viewBox="0 0 200 400"
            className="w-full max-w-xs h-auto border rounded-lg bg-gray-50 dark:bg-gray-800 p-4"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Interactive human body diagram for symptom selection"
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
              tabIndex="0"
              role="button"
              aria-label="Select head area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('head')}
            />
            <text x="100" y="45" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Head</text>

            {/* Torso */}
            <rect
              x="75"
              y="70"
              width="50"
              height="80"
              rx="10"
              fill={selectedBodyPart === 'chest' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('chest')}
              tabIndex="0"
              role="button"
              aria-label="Select chest area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('chest')}
            />
            <text x="100" y="115" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Chest</text>

            {/* Abdomen */}
            <rect
              x="75"
              y="155"
              width="50"
              height="60"
              rx="10"
              fill={selectedBodyPart === 'abdomen' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('abdomen')}
              tabIndex="0"
              role="button"
              aria-label="Select abdomen area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('abdomen')}
            />
            <text x="100" y="185" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Abdomen</text>

            {/* Arms */}
            <rect
              x="40"
              y="100"
              width="25"
              height="80"
              rx="12"
              fill={selectedBodyPart === 'arms' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('arms')}
              tabIndex="0"
              role="button"
              aria-label="Select arms area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('arms')}
            />
            <rect
              x="135"
              y="100"
              width="25"
              height="80"
              rx="12"
              fill={selectedBodyPart === 'arms' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('arms')}
              tabIndex="0"
              role="button"
              aria-label="Select arms area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('arms')}
            />
            <text x="52" y="150" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Arms</text>

            {/* Legs */}
            <rect
              x="85"
              y="220"
              width="15"
              height="100"
              rx="7"
              fill={selectedBodyPart === 'legs' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('legs')}
              tabIndex="0"
              role="button"
              aria-label="Select legs area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('legs')}
            />
            <rect
              x="100"
              y="220"
              width="15"
              height="100"
              rx="7"
              fill={selectedBodyPart === 'legs' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('legs')}
              tabIndex="0"
              role="button"
              aria-label="Select legs area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('legs')}
            />
            <text x="107" y="285" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Legs</text>

            {/* Back area */}
            <rect
              x="75"
              y="70"
              width="50"
              height="80"
              rx="10"
              fill={selectedBodyPart === 'back' ? '#3B82F6' : '#F3F4F6'}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="3,3"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => handleBodyPartClick('back')}
              tabIndex="0"
              role="button"
              aria-label="Select back area for symptoms"
              onKeyDown={(e) => e.key === 'Enter' && handleBodyPartClick('back')}
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