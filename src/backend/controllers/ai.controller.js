import * as aiService from '../services/ai.service.js';

/**
 * Get todo suggestions based on user input
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function getSuggestions(req, res) {
    try {
        const { input } = req.body;
        
        if (!input) {
            return res.status(400).json({ message: 'Input text is required' });
        }
        
        const suggestions = await aiService.getSuggestions(input);
        res.json({ suggestions });
    } catch (error) {
        console.error('Error in getSuggestions controller:', error);
        res.status(500).json({ 
            message: 'Error generating suggestions',
            error: error.message
        });
    }
}
