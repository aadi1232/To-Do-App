import axios from 'axios';
import { GEMINI_API_KEY } from '../../lib/env'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get todo suggestions based on user input
 * @param {string} userInput - The partial todo text input by user
 * @returns {Promise<Array<string>>} - Array of suggested todo items
 */
export async function getSuggestions(userInput) {
  try {
    // Skip empty inputs
    if (!userInput || userInput.trim().length === 0) {
      return [];
    }

    const prompt = `
    You are a helpful todo list assistant. Based on the following partial todo item, 
    suggest 3 clear, concise, and specific ways to complete it. Each suggestion should be 
    actionable and well-defined. Only return the suggestions without any additional text.
    
    Partial todo: "${userInput}"
    `;
    const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      }
    );

    // Extract text from response
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Process the text into an array of suggestions
    const suggestions = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('-'))
      .slice(0, 3); // Ensure we only have max 3 suggestions

    return suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error.response?.data || error.message);
    return [];
  }
}
