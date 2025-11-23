/**
 * Service for Google Gemini API integration
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.5-flash' // Fast and cost-effective
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

/**
 * Generates recommended words based on child's progress
 * @param {Object} context - Context about the child's progress
 * @param {Array} context.masteredWords - Array of mastered word objects
 * @param {Array} context.inProgressWords - Array of in-progress word objects
 * @param {Array} context.strugglingWords - Array of struggling word objects
 * @param {Array} context.allWords - Array of all current words
 * @param {string} context.childName - Name of the child
 * @returns {Promise<Array>} Array of recommended word objects with text and breakdown
 */
export async function getRecommendedWords(context = {}) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not found. Cannot generate word recommendations.')
    return []
  }

  const { masteredWords = [], inProgressWords = [], strugglingWords = [], allWords = [], childName = '' } = context

  try {
    const prompt = buildRecommendationPrompt(masteredWords, inProgressWords, strugglingWords, allWords, childName)
    
    console.log('🚀 Generating word recommendations from Gemini...')
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      return []
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text.trim()
      const recommendedWords = parseRecommendedWords(responseText)
      console.log('✅ Generated recommendations:', recommendedWords)
      return recommendedWords
    }

    return []
  } catch (error) {
    console.error('❌ Error generating word recommendations:', error)
    return []
  }
}

/**
 * Builds a prompt for Gemini to generate word recommendations
 */
function buildRecommendationPrompt(masteredWords, inProgressWords, strugglingWords, allWords, childName) {
  let prompt = `You are helping a child learn pronunciation. Generate 3-5 word recommendations that are:
1. Similar in style/complexity to words the child has already mastered
2. Slightly more challenging than mastered words (next level up)
3. Age-appropriate for a child learning pronunciation
4. Not already in the current word list

Current word list: ${allWords.map(w => w.text).join(', ')}

Mastered words (child can pronounce these well): ${masteredWords.map(w => w.text).join(', ') || 'None yet'}
In progress words (child is learning these): ${inProgressWords.map(w => w.text).join(', ') || 'None'}
Struggling words (child finds these difficult): ${strugglingWords.map(w => w.text).join(', ') || 'None'}

${childName ? `The child's name is ${childName}. ` : ''}

Generate 3-5 new words that would be good next steps. For each word, provide:
- The word text
- A pronunciation breakdown using hyphens (e.g., "Hel-lo" or "But-ter-fly")

Format your response as a JSON array like this:
[
  {"text": "Word1", "breakdown": "Word - 1"},
  {"text": "Word2", "breakdown": "Word - 2"}
]

Return ONLY the JSON array, no additional text or explanation.`

  return prompt
}

/**
 * Parses the Gemini response to extract word recommendations
 */
function parseRecommendedWords(responseText) {
  try {
    // Try to extract JSON from the response
    // Remove markdown code blocks if present
    let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }
    
    const words = JSON.parse(jsonText)
    
    // Validate and format the words
    if (Array.isArray(words)) {
      return words
        .filter(w => w.text && w.breakdown)
        .map(w => ({
          text: w.text.trim(),
          breakdown: w.breakdown.trim().replace(/\s*-\s*/g, ' - ') // Normalize hyphens
        }))
        .slice(0, 5) // Limit to 5 words
    }
    
    return []
  } catch (error) {
    console.error('Error parsing recommended words:', error)
    console.log('Response text:', responseText)
    
    // Fallback: try to extract words manually
    return extractWordsFromText(responseText)
  }
}

/**
 * Fallback: Extract words from text if JSON parsing fails
 */
function extractWordsFromText(text) {
  const words = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    // Look for patterns like "Word: breakdown" or "Word - breakdown"
    const match = line.match(/(\w+)[\s:]+([\w\s-]+)/i)
    if (match) {
      words.push({
        text: match[1].trim(),
        breakdown: match[2].trim()
      })
      if (words.length >= 5) break
    }
  }
  
  return words
}

/**
 * Generates pronunciation breakdown for a word
 * @param {string} word - The word to generate breakdown for
 * @returns {Promise<string>} Pronunciation breakdown (e.g., "Hel - lo")
 */
export async function generatePronunciationBreakdown(word) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not found. Cannot generate pronunciation breakdown.')
    return word // Return word as fallback
  }

  if (!word || !word.trim()) {
    return word
  }

  try {
    const prompt = `Generate a pronunciation breakdown for the word "${word.trim()}". 
Use hyphens to separate syllables (e.g., "Hello" -> "Hel - lo", "Butterfly" -> "But - ter - fly").
Return ONLY the breakdown with hyphens, no additional text or explanation.`

    console.log('🚀 Generating pronunciation breakdown for:', word)
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      return word // Return word as fallback
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const breakdown = data.candidates[0].content.parts[0].text.trim()
      // Clean up the response - remove any extra text
      const cleanBreakdown = breakdown.split('\n')[0].trim()
      console.log('✅ Generated breakdown:', cleanBreakdown)
      return cleanBreakdown || word
    }

    return word
  } catch (error) {
    console.error('❌ Error generating pronunciation breakdown:', error)
    return word // Return word as fallback
  }
}

/**
 * Helper function to list available models (for debugging)
 */
export async function listAvailableModels() {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ No API key found')
    return
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    )
    const data = await response.json()
    console.log('📋 Available models:', data)
    if (data.models) {
      const modelNames = data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
      console.log('✅ Models that support generateContent:', modelNames)
      return modelNames
    }
  } catch (error) {
    console.error('❌ Error listing models:', error)
  }
}

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  window.listGeminiModels = listAvailableModels
}

