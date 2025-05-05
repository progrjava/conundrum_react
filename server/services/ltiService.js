// services/ltiService.js
const crypto = require('crypto');

// --- Вспомогательные функции ---
function generateNonce(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

function generateTimestamp() {
    return Math.floor(Date.now() / 1000).toString();
}

// --- Функция для создания XML ---
function buildReplaceResultXML(sourcedId, score) {
    const messageIdentifier = generateNonce(20); // Уникальный ID для запроса
    // Оценка должна быть между 0.0 и 1.0
    const normalizedScore = Math.max(0, Math.min(1, score)).toFixed(2);

    return `
<?xml version = "1.0" encoding = "UTF-8"?>
<imsx_POXEnvelopeRequest xmlns = "http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
    <imsx_POXHeader>
        <imsx_POXRequestHeaderInfo>
            <imsx_version>V1.0</imsx_version>
            <imsx_messageIdentifier>${messageIdentifier}</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
    </imsx_POXHeader>
    <imsx_POXBody>
        <replaceResultRequest>
            <resultRecord>
                <sourcedGUID>
                    <sourcedId>${sourcedId}</sourcedId>
                </sourcedGUID>
                <result>
                    <resultScore>
                        <language>en</language>
                        <textString>${normalizedScore}</textString>
                    </resultScore>
                </result>
            </resultRecord>
        </replaceResultRequest>
    </imsx_POXBody>
</imsx_POXEnvelopeRequest>
    `.trim();
}

// --- Функция для подписи ИСХОДЯЩЕГО запроса ---
function signOAuth1Request(method, url, params, consumerKey, consumerSecret, body = null) {
    const oauthParams = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: generateTimestamp(),
        oauth_version: '1.0',
        ...params // Добавляем любые другие параметры, которые НЕ oauth_
    };

    // Если есть тело запроса и оно не form-urlencoded, нужен oauth_body_hash
    if (body && typeof body === 'string') {
        const bodyHash = crypto.createHash('sha1').update(body).digest('base64');
        oauthParams.oauth_body_hash = bodyHash;
         console.log("Calculated oauth_body_hash:", bodyHash);
    }

    // Собираем параметры для подписи (oauth_ + другие из params + oauth_body_hash)
    const paramsToSign = { ...oauthParams };

    // Кодируем и сортируем параметры
    const encodedParams = Object.keys(paramsToSign)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsToSign[key])}`)
        .join('&');

    // Формируем базовую строку
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(encodedParams)}`;
     console.log("OAuth Base String for signing:", baseString);

    // Формируем ключ
    const signingKey = `${encodeURIComponent(consumerSecret)}&`; // Token secret пустой для LTI

    // Генерируем подпись
    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
     console.log("Generated OAuth Signature:", signature);

    // Возвращаем все OAuth параметры, включая подпись, для заголовка Authorization
    return {
        ...oauthParams,
        oauth_signature: signature
    };
}

// --- Основная функция отправки оценки ---
async function sendGradeToMoodle(outcomeUrl, sourcedId, score, totalScore, consumerKey, consumerSecret) {
    console.log(`Sending grade to Moodle: score=${score}, total=${totalScore}, sourcedId=${sourcedId}, url=${outcomeUrl}`);

    if (!outcomeUrl || !sourcedId || score === undefined || score === null || !consumerKey || !consumerSecret) {
        throw new Error("Missing required parameters for sending grade to Moodle.");
    }

    // Нормализуем оценку (0.0 - 1.0)
    const normalizedScore = totalScore > 0 ? score / totalScore : 0;

    // Строим XML
    const xmlBody = buildReplaceResultXML(sourcedId, normalizedScore);
    console.log("Generated XML Body:", xmlBody);

    // Генерируем параметры OAuth и подпись
    const oauthParamsWithSignature = signOAuth1Request(
        'POST',
        outcomeUrl,
        {}, // Нет дополнительных параметров, кроме OAuth и body_hash
        consumerKey,
        consumerSecret,
        xmlBody // Передаем тело для расчета oauth_body_hash
    );

    // Формируем заголовок Authorization
    const authHeader = 'OAuth ' + Object.keys(oauthParamsWithSignature)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParamsWithSignature[key])}"`)
        .join(',');

    console.log("Authorization Header:", authHeader);

    try {
        const response = await fetch(outcomeUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/xml', // Важно указать тип контента
                'Content-Length': Buffer.byteLength(xmlBody).toString()
            },
            body: xmlBody
        });

        const responseText = await response.text(); // Читаем ответ от Moodle
        console.log("Moodle Grade Response Status:", response.status);
        console.log("Moodle Grade Response Body:", responseText);

        if (!response.ok) {
            // Пытаемся извлечь код ошибки из XML ответа Moodle
            const failureMatch = responseText.match(/<imsx_codeMajor>(.*?)<\/imsx_codeMajor>/);
            const descriptionMatch = responseText.match(/<imsx_description>(.*?)<\/imsx_description>/);
            const failureCode = failureMatch ? failureMatch[1] : 'unknown';
            const failureDescription = descriptionMatch ? descriptionMatch[1] : response.statusText;
            throw new Error(`Moodle grade submission failed (${response.status} ${failureCode}): ${failureDescription}`);
        }

        // Ищем признак успеха в ответе
        if (responseText.includes('<imsx_codeMajor>success</imsx_codeMajor>')) {
            console.log('Grade successfully submitted to Moodle.');
            return true;
        } else {
            console.warn('Moodle response did not explicitly indicate success, but status was OK.');
            // Можно считать успехом, если статус OK, но лучше проверять тело
             const failureMatch = responseText.match(/<imsx_codeMajor>(.*?)<\/imsx_codeMajor>/);
             const descriptionMatch = responseText.match(/<imsx_description>(.*?)<\/imsx_description>/);
             const failureCode = failureMatch ? failureMatch[1] : 'unknown_ok_status';
             const failureDescription = descriptionMatch ? descriptionMatch[1] : 'No specific success code found.';
             console.warn(`Potential issue: ${failureCode} - ${failureDescription}`);
             // На всякий случай вернем true, раз статус ОК
            return true;
            // Либо бросить ошибку: throw new Error(`Moodle response status OK, but no success code found: ${failureDescription}`);
        }

    } catch (error) {
        console.error('Error sending grade request to Moodle:', error);
        // Пробрасываем ошибку, чтобы ее обработал вызывающий код
        throw error;
    }
}

module.exports = { sendGradeToMoodle };