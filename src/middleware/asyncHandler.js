// src/utils/asyncHandler.js

/**
 * Обертка для асинхронных обработчиков в Express
 * Автоматически перехватывает ошибки и передает их в middleware обработки ошибок
 * @param {Function} fn - Асинхронная функция-обработчик
 * @returns {Function} - Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  asyncHandler
};