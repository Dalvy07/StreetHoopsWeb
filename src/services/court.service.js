// src/services/court.service.js
const courtRepository = require('../repositories/court.repository');
const gameRepository = require('../repositories/game.repository');
const { AuthError, ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Сервис для работы с площадками
 */
class CourtService {
  /**
   * Создание новой площадки
   * @param {Object} courtData - Данные площадки
   * @returns {Promise<Object>} - Созданная площадка
   */
  async createCourt(courtData) {
    // Валидация данных
    this.validateCourtData(courtData);

    // Создаем площадку
    const newCourt = await courtRepository.create(courtData);

    return newCourt;
  }

  /**
   * Получение всех площадок с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {Object} filter - Фильтры
   * @returns {Promise<Object>} - Площадки с пагинацией
   */
  async getAllCourts(page = 1, limit = 10, filter = {}) {
    return await courtRepository.findAll(page, limit, filter);
  }

  /**
   * Получение площадок поблизости
   * @param {number} longitude - Долгота
   * @param {number} latitude - Широта
   * @param {number} distance - Расстояние в метрах
   * @param {Object} filter - Дополнительные фильтры
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Площадки поблизости
   */
  async getNearbyCourts(longitude, latitude, distance = 5000, filter = {}, page = 1, limit = 10) {
    // Валидация координат
    if (!this.isValidCoordinate(longitude, latitude)) {
      throw new ValidationError('Invalid coordinates provided');
    }

    return await courtRepository.findNearby(longitude, latitude, distance, filter, page, limit);
  }

  /**
   * Получение площадки по ID
   * @param {string} courtId - ID площадки
   * @returns {Promise<Object>} - Площадка
   */
  async getCourtById(courtId) {
    return await courtRepository.findById(courtId);
  }

  /**
   * Обновление площадки (только администраторы)
   * @param {string} courtId - ID площадки
   * @param {Object} updateData - Данные для обновления
   * @param {string} userRole - Роль пользователя
   * @returns {Promise<Object>} - Обновленная площадка
   */
  async updateCourt(courtId, updateData, userRole) {
    // Проверяем права на редактирование - только администраторы
    if (userRole !== 'admin') {
      throw AuthError.insufficientPermissions('Only administrators can update courts');
    }

    // Валидация данных обновления
    if (updateData.location) {
      this.validateCourtData(updateData);
    }

    return await courtRepository.update(courtId, updateData);
  }

  /**
   * Удаление площадки (только администраторы)
   * @param {string} courtId - ID площадки
   * @param {string} userRole - Роль пользователя
   * @returns {Promise<boolean>} - Результат удаления
   */
  async deleteCourt(courtId, userRole) {
    // Проверяем права на удаление - только администраторы
    if (userRole !== 'admin') {
      throw AuthError.insufficientPermissions('Only administrators can delete courts');
    }

    // Проверяем, есть ли запланированные игры на этой площадке
    const upcomingGames = await gameRepository.findByCourt(courtId, 1, 1);
    if (upcomingGames.total > 0) {
      throw new ValidationError('Cannot delete court with scheduled games');
    }

    return await courtRepository.delete(courtId);
  }

  /**
   * Добавление отзыва к площадке
   * @param {string} courtId - ID площадки
   * @param {Object} reviewData - Данные отзыва
   * @returns {Promise<Object>} - Обновленная площадка
   */
  async addReview(courtId, reviewData) {
    // Валидация отзыва
    if (!reviewData.text || reviewData.text.trim().length < 10) {
      throw new ValidationError('Review text must be at least 10 characters long');
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    return await courtRepository.addReview(courtId, reviewData);
  }

  /**
   * Получение игр на площадке
   * @param {string} courtId - ID площадки
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {Date} fromDate - Начальная дата
   * @param {Date} toDate - Конечная дата
   * @returns {Promise<Object>} - Игры на площадке
   */
  async getCourtGames(courtId, page = 1, limit = 10, fromDate = new Date(), toDate = null) {
    // Проверяем существование площадки
    await courtRepository.findById(courtId);

    // Если конечная дата не указана, берем неделю от начальной даты
    if (!toDate) {
      toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7);
    }

    // Получаем игры на площадке в указанный период
    const filter = {
      court: courtId,
      status: 'scheduled',
      dateTime: {
        $gte: fromDate,
        $lte: toDate
      }
    };

    return await gameRepository.findAll(page, limit, filter);
  }

  /**
   * Получение площадок пользователя
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Площадки пользователя
   */
  async getUserCourts(userId, page = 1, limit = 10) {
    return await courtRepository.findByCreator(userId, page, limit);
  }

  /**
   * Проверка доступности площадки
   * @param {string} courtId - ID площадки
   * @param {Date} date - Дата
   * @param {string} startTime - Время начала
   * @param {string} endTime - Время окончания
   * @returns {Promise<boolean>} - Доступность площадки
   */
  async checkAvailability(courtId, date, startTime, endTime) {
    // Валидация времени
    if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
      throw new ValidationError('Invalid time format. Use HH:MM format');
    }

    if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
      throw new ValidationError('Start time must be before end time');
    }

    return await courtRepository.checkAvailability(courtId, date, startTime, endTime);
  }

  /**
   * Получение площадок по типу спорта
   * @param {string} sportType - Тип спорта
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Площадки по типу спорта
   */
  async getCourtsBySportType(sportType, page = 1, limit = 10) {
    return await courtRepository.findBySportType(sportType, page, limit);
  }

  // Вспомогательные методы

  /**
   * Валидация данных площадки
   * @param {Object} courtData - Данные площадки
   */
  validateCourtData(courtData) {
    if (!courtData.name || courtData.name.trim().length < 3) {
      throw new ValidationError('Court name must be at least 3 characters long');
    }

    if (!courtData.location || !courtData.location.coordinates || !courtData.location.address) {
      throw new ValidationError('Court location with coordinates and address is required');
    }

    const [longitude, latitude] = courtData.location.coordinates;
    if (!this.isValidCoordinate(longitude, latitude)) {
      throw new ValidationError('Invalid coordinates provided');
    }

    if (!courtData.sportTypes || !Array.isArray(courtData.sportTypes) || courtData.sportTypes.length === 0) {
      throw new ValidationError('At least one sport type is required');
    }

    // Валидация рабочих часов, если они указаны
    if (courtData.workingHours) {
      this.validateWorkingHours(courtData.workingHours);
    }
  }

  /**
   * Валидация рабочих часов
   * @param {Object} workingHours - Рабочие часы
   */
  validateWorkingHours(workingHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      if (workingHours[day]) {
        const { open, close } = workingHours[day];
        
        if (open && !this.isValidTimeFormat(open)) {
          throw new ValidationError(`Invalid opening time format for ${day}`);
        }
        
        if (close && !this.isValidTimeFormat(close)) {
          throw new ValidationError(`Invalid closing time format for ${day}`);
        }
        
        if (open && close && this.timeToMinutes(open) >= this.timeToMinutes(close)) {
          throw new ValidationError(`Opening time must be before closing time for ${day}`);
        }
      }
    });
  }

  /**
   * Проверка валидности координат
   * @param {number} longitude - Долгота
   * @param {number} latitude - Широта
   * @returns {boolean} - Валидность координат
   */
  isValidCoordinate(longitude, latitude) {
    return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
  }

  /**
   * Проверка формата времени
   * @param {string} time - Время в формате HH:MM
   * @returns {boolean} - Валидность формата
   */
  isValidTimeFormat(time) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  /**
   * Преобразование времени в минуты
   * @param {string} timeStr - Время в формате HH:MM
   * @returns {number} - Время в минутах
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

module.exports = new CourtService();