const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a patient summary using the Google Gemini model.
 * @param {object} patientData - An object containing the patient's information.
 * @returns {Promise<string>} The AI-generated summary.
 */
const generateSummary = async (patientData) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.log('GEMINI_API_KEY not configured. Returning rule-based summary.');
    // Fallback to a simple rule-based summary if the API key is not set
    return `Rule-based summary for ${patientData.name}:\n- Current Symptoms: ${patientData.currentSymptoms}\n- Allergies: ${patientData.allergies.join(', ') || 'None'}\n- Chronic Conditions: ${patientData.chronicConditions.join(', ') || 'None'}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are a medical assistant AI. Your task is to create a concise, professional summary of a patient's condition for a doctor before an appointment.
      Focus on clarity and highlight critical information.

      Patient Information:
      - Name: ${patientData.name}
      - Current Symptoms: ${patientData.currentSymptoms}
      - Allergies: ${patientData.allergies.join(', ') || 'None reported'}
      - Chronic Conditions: ${patientData.chronicConditions.join(', ') || 'None reported'}

      Notes from Last Two Visits:
      1. ${patientData.pastVisits[0] ? `Date: ${patientData.pastVisits[0].date}, Notes: ${patientData.pastVisits[0].notes}` : 'No recent visit'}
      2. ${patientData.pastVisits[1] ? `Date: ${patientData.pastVisits[1].date}, Notes: ${patientData.pastVisits[1].notes}` : 'No second recent visit'}

      Please generate a summary based on this data.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return summary;
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    // If the API fails, provide a fallback summary
    return 'AI summary could not be generated at this time. Please review the patient details manually.';
  }
};

module.exports = { generateSummary };
