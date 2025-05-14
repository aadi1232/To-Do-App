/**
 * Fetches AI suggestions for todo items based on input text
 * @param {string} input - The partial todo text
 * @returns {Promise<string[]>} - Array of suggested completions
 */
export async function getSuggestions(input) {
  try {
    // Don't request suggestions for very short inputs
    if (!input || input.trim().length < 2) {
      return [];
    }
    
    const response = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching suggestions: ${response.status}`);
    }
    
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return [];
  }
}
