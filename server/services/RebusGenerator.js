// Файл: server/services/RebusGenerator.js

const CrosswordGenerator = require('./CrosswordGenerator');
const { cleanApiResponse } = require('../utils/jsonUtils');

class RebusGenerator extends CrosswordGenerator {
    constructor(apiKey, apiUrl) {
        super(apiKey, apiUrl);
        this.freepikApiKey = process.env.FREEPIK_API_KEY;
    }

    async generateRebus(text, inputType, totalWords, difficulty = 'normal') {
        try {
            const prompt = this.createRebusPrompt(text, inputType, totalWords);
            
            const headers = {
                'Authorization': `Bearer ${this.openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': '*',
                'X-Title': 'Conundrum Rebus Generator',
                'User-Agent': 'Conundrum/1.0.0'
            };

            const response = await fetch(this.openrouterApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: "google/gemma-3-27b-it:free", 
                    messages: [{ role: "user", content: prompt }],
                    top_p: 1,
                    temperature: 0.7,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5,
                    repetition_penalty: 1,
                    top_k: 50
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API error: ${response.status}`);
            }

            const responseData = await response.json();
            const generatedText = responseData?.choices?.[0]?.message?.content;

            if (!generatedText) throw new Error('Нейросеть не сгенерировала текст...');

            const cleanedJson = cleanApiResponse(generatedText);
            let rebusData = JSON.parse(cleanedJson);

            const rebusPromises = rebusData.map(async (rebus) => {
                if (!rebus.parts) return null;
                
                const partPromises = rebus.parts.map(async (part) => {
                    if (part.type === 'image' && part.description) {
                        // Вызываем новый метод для Freepik
                        part.imageUrl = await this.findFreepikIconUrl(part.description);
                    }
                    return part;
                });

                rebus.parts = await Promise.all(partPromises);
                return rebus;
            });

            const validRebuses = (await Promise.all(rebusPromises)).filter(item => item && item.word);

            if (validRebuses.length === 0) {
                throw new Error("Нейросеть не смогла придумать валидные ребусы.");
            }

            return { rebuses: validRebuses };

        } catch (error) {
            console.error('Error in generateRebus:', error);
            throw error;
        }
    }

    // НОВЫЙ МЕТОД ДЛЯ ПОИСКА ИКОНОК НА FREEPIK
    async findFreepikIconUrl(description) {
        const fallbackUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E";

        if (!this.freepikApiKey) {
            console.warn("FREEPIK_API_KEY не установлен. Возвращаем заглушку.");
            return fallbackUrl;
        }

        const query = encodeURIComponent(description.split(' ')[0]); // Берем только первое слово для точности
        const url = `https://api.freepik.com/v1/resources?term=${query}&per_page=1&order=relevance&filters[content_type][value]=icon`;
        try {
            const response = await fetch(url, {
                headers: {
                    'x-freepik-api-key': this.freepikApiKey,
                    'Accept-Language': 'ru-RU'
                }
            });

            if (!response.ok) {
                console.error(`Freepik API error: ${response.status} ${response.statusText}`);
                return fallbackUrl;
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const icon = data.data[0];
                // Ищем URL картинки внутри ответа
                if (icon.image && icon.image.source && icon.image.source.url) {
                    return icon.image.source.url;
                }
            }
            
            console.warn(`Freepik: иконка для "${description}" не найдена.`);
            return fallbackUrl;

        } catch (error) {
            console.error('Error fetching from Freepik:', error);
            return fallbackUrl;
        }
    }

    createRebusPrompt(text, inputType, totalWords) {  
       const context = inputType === 'topic' 
            ? `related to the topic "${text}"` 
            : `extracted from the text: "${text}"`;

        return `
        Generate ${totalWords} creative and LOGICALLY CORRECT Rebus puzzles ${context}.
        
        Break each word into parts: "text" (letters) or "image" (a visual object).
        
        JSON Structure:
        [
            {
                "word": "TARGET_WORD",
                "parts": [
                    { "type": "text", "content": "LETTERS" },
                    { 
                    "type": "image", 
                    "description": "RUSSIAN description (e.g. кот, дом)", 
                    "subtract_start": 0, // Number of letters to remove from START
                    "subtract_end": 1  // Number of letters to remove from END
                    }
                ]
            }
        ]

        EXTREMELY IMPORTANT RULES:
        1.  **DO NOT replace letters inside an image word.** Example: for "КОЗА", DO NOT use image "КОСА" and replace 'C' with 'З'. This is FORBIDDEN.
        2.  **ONLY use "subtract_start" and "subtract_end" to modify image words.** This is the ONLY allowed modification.
        3.  **Double-check your logic and letter count!** The parts MUST assemble into the EXACT target word.
        4.  Use only simple, concrete, easy-to-draw nouns for images.
        5.  Image descriptions MUST be in RUSSIAN.
        6.  Output ONLY a valid JSON array.

        Example:
        - Target: "ПОДВАЛ"
        - Logic: Text "ПОД" + Image "ВАЛ" (волна).
        - Correct JSON: [{"word": "ПОДВАЛ", "parts": [{"type": "text", "content": "ПОД"}, {"type": "image", "description": "волна", "subtract_start": 0, "subtract_end": 0}]}]
        
        Example with subtraction:
        - Target: "УДОЧКА"
        - Logic: Image "ДУДОЧКА" -> remove "Д" from start.
        - Correct JSON: [{"word": "УДОЧКА", "parts": [{"type": "image", "description": "дудочка", "subtract_start": 1, "subtract_end": 0}]}]
        `;
    }
}

module.exports = RebusGenerator;