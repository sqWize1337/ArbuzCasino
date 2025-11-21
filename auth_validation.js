/**
 * TWA Backend HASH Validation (Node.js)
 * * Этот код должен быть запущен на вашем СЕРВЕРЕ (например, с использованием Express.js)
 * Он демонстрирует критически важный шаг: криптографическую проверку данных, 
 * полученных от Telegram Web App (TWA), для обеспечения их подлинности.
 * * БЕЗ ЭТОЙ ПРОВЕРКИ, ВАША РЕГИСТРАЦИЯ НЕ БУДЕТ БЕЗОПАСНОЙ и, скорее всего, 
 * будет отклоняться вашим сервером или приведет к уязвимости.
 */

const crypto = require('crypto');

// ! ВАЖНО: Замените это на реальный токен вашего бота, полученный от @BotFather
const BOT_TOKEN = '8495294858:AAHI_Zx1YNOjXt6qQ6lT9CHoEzvUOoDo0ZU'; 

/**
 * Проверяет подлинность initData, полученного от Telegram Web App.
 * * @param {string} initData Полная строка initData, полученная из Telegram.WebApp.initData
 * @returns {boolean} true, если данные подлинны, false в противном случае.
 */
function checkTelegramAuth(initData) {
    // 1. Парсим initData и отделяем hash
    const params = new URLSearchParams(initData);
    const receivedHash = params.get('hash');
    params.delete('hash');
    
    // 2. Формируем строку данных для проверки
    // Правило: собираем все пары 'ключ=значение', кроме 'hash', сортируем ключи по алфавиту, 
    // и объединяем их через \n.
    const dataCheckString = Array.from(params.entries())
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('\n');

    // 3. Создаем секретный ключ (Secret Key)
    // Secret Key = HMAC-SHA256 хеш от строки "WebAppData" с использованием токена бота
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(BOT_TOKEN)
        .digest();

    // 4. Вычисляем проверочный HASH (Calculated Hash)
    // Calculated Hash = HMAC-SHA256 хеш от dataCheckString с использованием secretKey
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // 5. Сравниваем полученный HASH с вычисленным
    const isValid = calculatedHash === receivedHash;

    if (isValid) {
        console.log("✅ HASH-проверка успешна. Пользователь аутентифицирован.");
        return true;
    } else {
        console.error("❌ Ошибка HASH-проверки. Данные подделаны или некорректны.");
        return false;
    }
}

// Пример использования (вы должны получить initData из POST-запроса от клиента)
// const exampleInitData = 'query_id=...&user=...&auth_date=...&hash=...';
// if (checkTelegramAuth(exampleInitData)) {
//     // Здесь логика регистрации или входа пользователя
// }