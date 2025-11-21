/**
 * TWA Server Example (Node.js)
 * * * ЭТО ПОЛНЫЙ ПРИМЕР СЕРВЕРА НА NODE.JS С ИСПОЛЬЗОВАНИЕМ EXPRESS. 
 * * Замените 'YOUR_BOT_TOKEN_HERE' на токен вашего бота.
 * * Установите зависимости: npm install express crypto body-parser
 * * Запустите: node twa_server_example.js
 */

const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// ! ВАЖНО: Замените это на реальный токен вашего бота, полученный от @BotFather
const BOT_TOKEN = '8495294858:AAHI_Zx1YNOjXt6qQ6lT9CHoEzvUOoDo0ZU'; 

// Разрешаем CORS для тестирования с локального хоста или GitHub Pages
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Используем body-parser для обработки JSON-запросов
app.use(bodyParser.json());

/**
 * Проверяет подлинность initData, полученного от Telegram Web App.
 * * @param {string} initData Полная строка initData.
 * @returns {boolean} true, если данные подлинны.
 */
function checkTelegramAuth(initData) {
    try {
        const params = new URLSearchParams(initData);
        const receivedHash = params.get('hash');
        
        if (!receivedHash) {
            console.error("Нет HASH в данных.");
            return false;
        }
        
        params.delete('hash');
        
        // 1. Формируем строку данных для проверки
        const dataCheckString = Array.from(params.entries())
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n');

        // 2. Создаем секретный ключ (Secret Key)
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(BOT_TOKEN)
            .digest();

        // 3. Вычисляем проверочный HASH (Calculated Hash)
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // 4. Сравниваем
        const isValid = calculatedHash === receivedHash;

        if (isValid) {
            console.log("✅ HASH-проверка успешна.");
            return true;
        } else {
            console.error("❌ Ошибка HASH-проверки. Расчетный HASH:", calculatedHash, "Полученный HASH:", receivedHash);
            return false;
        }

    } catch (e) {
        console.error("Критическая ошибка при проверке HASH:", e);
        return false;
    }
}

// Эндпоинт для аутентификации Telegram Web App
app.post('/api/telegram-auth', (req, res) => {
    const initData = req.body.initData;

    if (!initData) {
        return res.status(400).json({ success: false, message: 'Отсутствует initData' });
    }

    if (checkTelegramAuth(initData)) {
        // --- ЗДЕСЬ ДОЛЖНА БЫТЬ ВАША ЛОГИКА РЕГИСТРАЦИИ/ВХОДА ---
        // 1. Извлекаем ID пользователя из initData (для создания сессии)
        // 2. Создаем JWT токен или сессию для клиента
        // ----------------------------------------------------
        
        return res.json({ success: true, message: 'Аутентификация успешна. Вы вошли в систему.' });
    } else {
        return res.status(401).json({ success: false, message: 'Неверный HASH. Аутентификация провалена.' });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log("!!! НЕ ЗАБУДЬТЕ ЗАМЕНИТЬ 'YOUR_BOT_TOKEN_HERE' НА НАСТОЯЩИЙ ТОКЕН БОТА !!!");
});
