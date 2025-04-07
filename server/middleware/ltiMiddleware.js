require('dotenv').config();
const crypto = require('crypto');

const initializeLTI = () => {
    // Функция для проверки подписи LTI запроса
    const validateLTIRequest = (req, res, next) => {
        // Получаем подпись из запроса (из body ИЛИ headers)
        const oauthSignature = req.body.oauth_signature || req.headers['oauth_signature'];
        // Получаем секрет из переменных окружения
        const consumerSecret = process.env.LTI_SECRET;

        if (!consumerSecret) {
            console.error('Error: LTI_SECRET environment variable is not set.');
            return res.status(500).send('LTI configuration error.');
        }

        if (!oauthSignature) {
            console.log('Request body:', req.body); // Логируем для отладки
            console.log('Request headers:', req.headers); // Логируем для отладки
            return res.status(401).send('Unauthorized: Missing OAuth signature');
        }

        // Проверяем подпись
        const isValid = verifySignature(req, consumerSecret);

        if (!isValid) {
            console.error('Invalid LTI signature');
            return res.status(401).send('Unauthorized: Invalid OAuth signature');
        }

        // Аутентификация успешна
        const userId = req.body.user_id;
        req.session.userId = userId;
        req.session.lti = true;
        // Сохраняем нужные LTI параметры в сессию (например, для Grade Passback)
        req.session.lis_outcome_service_url = req.body.lis_outcome_service_url;
        req.session.lis_result_sourcedid = req.body.lis_result_sourcedid;


        console.log('LTI validation successful for user:', userId);
        next(); // Переходим к следующему middleware
    };

    // Функция для проверки подписи OAuth 1.0a
    const verifySignature = (req, consumerSecret) => {
        console.log("Verifying signature...");

        const oauthSignature = req.body.oauth_signature || req.headers['oauth_signature'];
        const params = { ...req.body };
        delete params.oauth_signature;

        // 1. Собираем и кодируем параметры
        const encodedParams = Object.keys(params)
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        console.log("Encoded Params:", encodedParams);

        // 2. Формируем базовую строку
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        // Используем HTTPS, если запрос пришел через ngrok (или другой HTTPS прокси)
        const baseUrl = url.startsWith('https') ? url : `https://${req.get('host')}${req.originalUrl}`;
        const baseString = `POST&${encodeURIComponent(baseUrl)}&${encodeURIComponent(encodedParams)}`;
        console.log("Base String:", baseString);

        // 3. Формируем ключ для HMAC
        const signingKey = `${encodeURIComponent(consumerSecret)}&`; // Добавляем '&' в конце

        // 4. Генерируем подпись
        const hash = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
        console.log("Calculated Hash:", hash);
        console.log("OAuth Signature:", oauthSignature);

        // 5. Сравниваем подписи безопасно (если возможно)
        try {
            return crypto.timingSafeEqual(Buffer.from(hash, 'base64'), Buffer.from(oauthSignature, 'base64'));
        } catch (e) {
            // Fallback for environments without timingSafeEqual or if buffers have different lengths
            return hash === oauthSignature;
        }
    };

    return {
        validateLTIRequest
    };
};

module.exports = { initializeLTI };