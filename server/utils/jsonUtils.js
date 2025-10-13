// Файл: server/utils/jsonUtils.js
const { jsonrepair } = require('jsonrepair');

function cleanApiResponse(generatedText) {
    if (!generatedText) return '[]';
    
    let cleaned = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.slice(1, -1);
    }

    const startIndex = cleaned.indexOf('[');
    if (startIndex === -1) return '[]';

    let endIndex = cleaned.lastIndexOf(']');
    const lastBrace = cleaned.lastIndexOf('}');

    if (endIndex === -1 || lastBrace > endIndex) {
        endIndex = lastBrace + 1;
    }
    
    cleaned = cleaned.substring(startIndex, endIndex);

    cleaned = cleaned
        .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
        .replace(/[\t\r\n]+/g, "")
        .replace(/\\"/g, '"');

    // --- АГРЕССИВНАЯ НОРМАЛИЗАЦИЯ ---

    cleaned = cleaned
        .replace(/'\s*(word|clue)\s*'/gi, '"$1"')
        .replace(/:\s*'([^']*)'/g, ':"$1"')
        .replace(/"\s*(word|clue)\s*"\s*:/gi, '"$1":')
        .replace(/([{,])\s*(word|clue)\s*:/gi, '$1"$2":')
        .replace(/"\s*(word|clue)\s*:"/gi, '"$1":')
        .replace(/"\s*clu[eе]\s*"\s*:/gi, '"clue":')
        .replace(/"\s*word\s*"\s*:/gi, '"word":')
        
        // --- НОВОЕ ПРАВИЛО: Clues -> clue ---
        .replace(/"\s*clues?\s*"\s*:/gi, '"clue":'); 
        // -------------------------------------

    cleaned = cleaned.replace(/("word"|"clue")\s*:\s*([^"{\[\s,])/g, '$1:"$2');

    cleaned = cleaned
        .replace(/:\s*,/g, ':') 
        .replace(/"\s*:\s*"/g, '":"')
        .replace(/"\s*,\s*"/g, '","')
        .replace(/{\s*"/g, '{"')
        .replace(/"\s*}/g, '"}')
        .replace(/\[\s*"/g, '["')
        .replace(/"\s*\]/g, '"]')
        .replace(/"\s*"/g, '","') 
        .replace(/}\s*{/g, "},{") 
        .replace(/",\s*"\s*(word|clue)/g, '","$1') 
        .replace(/,{2,}/g, ',')
        .replace(/,\s+/g, ',')
        .replace(/,\s*([}])/g, "$1");

    cleaned = cleaned.replace(/,\s*$/, '');

    if (!cleaned.endsWith(']')) {
        cleaned += ']';
    }
    
    try {
        const repaired = jsonrepair(cleaned);
        const parsed = JSON.parse(repaired);

        if (Array.isArray(parsed)) {
            return JSON.stringify(parsed);
        } else {
            return '[]';
        }
    } catch (error) {
        try {
            if (!cleaned.trim().endsWith(']')) {
                const patched = cleaned + ']';
                const repairedPatched = jsonrepair(patched);
                const parsedPatched = JSON.parse(repairedPatched);
                if (Array.isArray(parsedPatched)) {
                    return JSON.stringify(parsedPatched);
                }
            }
        } catch (e) {}
        return '[]';
    }
}

module.exports = { cleanApiResponse };