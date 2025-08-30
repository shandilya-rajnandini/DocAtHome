const asyncHandler = require('../middleware/asyncHandler.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const suggestSpecialty = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms are required' });
  }

  try {
    // First try Gemini AI, fallback to keyword matching if it fails
    let specialty, reasoning;
    
    try {
      const result = await getSpecialtyFromGemini(symptoms);
      specialty = result.specialty;
      reasoning = result.reasoning;
    } catch (geminiError) {
      console.log('Gemini AI failed, falling back to keyword matching:', geminiError.message);
      specialty = getSpecialtyFromKeywords(symptoms);
      reasoning = 'Based on keyword matching analysis of your symptoms.';
    }

    if (!specialty) {
      return res.status(404).json({ message: 'Could not determine specialty from symptoms' });
    }

    res.status(200).json({ specialty, reasoning });
  } catch (error) {
    console.error('Error in suggestSpecialty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const getSpecialtyFromGemini = async (symptoms) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a medical AI assistant. Based on the following symptoms, suggest the most appropriate medical specialty for the patient to consult. 

Symptoms: '${symptoms}'

Please respond in the following JSON format:
{
  'specialty': 'exact specialty name',
  'reasoning': 'brief explanation of why this specialty is recommended'
}

Available specialties to choose from:
- Cardiologist
- Dermatologist  
- Gynecologist
- Dentist
- Pediatrician
- General Physician
- Neurologist
- Gastroenterologist
- Orthopedic Surgeon
- Allergist
- Psychiatrist
- Endocrinologist
- Nephrologist
- Urologist
- Oncologist
- Hematologist
- Ophthalmologist
- Otolaryngologist
- Obstetrician
- Pulmonologist
- Rheumatologist
- Orthodontist
- Oral Surgeon
- Podiatrist
- Radiologist
- Anesthesiologist
- Surgeon
- Pathologist
- Emergency Medicine Physician
- Intensivist
- Physiatrist
- Pain Management Specialist
- Addiction Medicine Specialist
- Sleep Medicine Specialist
- Geneticist
- Hospice and Palliative Medicine Specialist
- Preventive Medicine Specialist
- Travel Medicine Specialist
- Wound Care Specialist

If symptoms are general or unclear, recommend 'General Physician'.
Only respond with valid JSON.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    // Clean the response text to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find JSON-like content if response is not pure JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!parsed.specialty || !parsed.reasoning) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return {
      specialty: parsed.specialty,
      reasoning: parsed.reasoning
    };
  } catch (parseError) {
    console.log('Gemini response text:', text);
    console.log('Parse error:', parseError.message);
    throw new Error('Failed to parse Gemini response');
  }
};

const getSpecialtyFromKeywords = (symptoms) => {
  const keywords = {
    'skin': 'Dermatologist',
    'rash': 'Dermatologist',
    'itchy': 'Dermatologist',
    'acne': 'Dermatologist',
    'eczema': 'Dermatologist',
    'psoriasis': 'Dermatologist',
    'mole': 'Dermatologist',
    'hair loss': 'Dermatologist',
    'nail': 'Dermatologist',
    'chest pain': 'Cardiologist',
    'heart': 'Cardiologist',
    'blood pressure': 'Cardiologist',
    'hypertension': 'Cardiologist',
    'cholesterol': 'Cardiologist',
    'arrhythmia': 'Cardiologist',
    'heart attack': 'Cardiologist',
    'stroke': 'Neurologist',
    'headache': 'Neurologist',
    'migraine': 'Neurologist',
    'seizure': 'Neurologist',
    'numbness': 'Neurologist',
    'tingling': 'Neurologist',
    'alzheimer': 'Neurologist',
    'parkinson': 'Neurologist',
    'stomach': 'Gastroenterologist',
    'abdominal pain': 'Gastroenterologist',
    'diarrhea': 'Gastroenterologist',
    'constipation': 'Gastroenterologist',
    'acid reflux': 'Gastroenterologist',
    'ibs': 'Gastroenterologist',
    'colonoscopy': 'Gastroenterologist',
    'joint pain': 'Orthopedic Surgeon',
    'fracture': 'Orthopedic Surgeon',
    'arthritis': 'Orthopedic Surgeon',
    'back pain': 'Orthopedic Surgeon',
    'knee pain': 'Orthopedic Surgeon',
    'hip pain': 'Orthopedic Surgeon',
    'sports injury': 'Orthopedic Surgeon',
    'fever': 'General Physician',
    'cough': 'General Physician',
    'cold': 'General Physician',
    'flu': 'General Physician',
    'sore throat': 'General Physician',
    'infection': 'General Physician',
    'fatigue': 'General Physician',
    'allergies': 'Allergist',
    'asthma': 'Allergist',
    'sinus': 'Allergist',
    'hay fever': 'Allergist',
    'hives': 'Allergist',
    'depression': 'Psychiatrist',
    'anxiety': 'Psychiatrist',
    'bipolar': 'Psychiatrist',
    'schizophrenia': 'Psychiatrist',
    'ptsd': 'Psychiatrist',
    'diabetes': 'Endocrinologist',
    'thyroid': 'Endocrinologist',
    'hormone': 'Endocrinologist',
    'kidney': 'Nephrologist',
    'bladder': 'Urologist',
    'prostate': 'Urologist',
    'eye': 'Ophthalmologist',
    'vision': 'Ophthalmologist',
    'ear': 'Otolaryngologist',
    'nose': 'Otolaryngologist',
    'throat': 'Otolaryngologist',
    'pregnancy': 'Obstetrician',
    'pregnant': 'Obstetrician',
    'lung': 'Pulmonologist',
    'breathing': 'Pulmonologist',
    'dental': 'Dentist',
    'teeth': 'Dentist',
    'toothache': 'Dentist'
  };

  const symptomText = symptoms.toLowerCase();

  for (const keyword in keywords) {
    if (symptomText.includes(keyword)) {
      return keywords[keyword];
    }
  }

  return 'General Physician';
};

module.exports = { suggestSpecialty };
