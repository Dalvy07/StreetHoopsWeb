// src/repositories/court.repository.js
const Court = require('../models/Court');
const { NotFoundError } = require('../utils/errors');

/**
 * Репозиторий для работы с площадками
 */
class CourtRepository {
  /**
   * Создание новой площадки
   * @param {Object} courtData - Данные площадки
   * @returns {Promise<Court>} - Созданная площадка
   */
  async create(courtData) {
    const court = new Court(courtData);
    return await court.save();
  }

  /**
   * Получение площадки по ID
   * @param {string} courtId - ID площадки
   * @returns {Promise<Court>} - Найденная площадка
   * @throws {NotFoundError} - Если площадка не найдена
   */
  async findById(courtId) {
    const court = await Court.findById(courtId);
    if (!court) {
      throw new NotFoundError('Court not found', 'Court', courtId);
    }
    return court;
  }

  /**
   * Получение всех площадок с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество площадок на странице
   * @param {Object} filter - Фильтры для поиска
   * @returns {Promise<{courts: Court[], total: number, page: number, limit: number}>}
   */
  async findAll(page = 1, limit = 10, filter = {}) {
    // Добавим фильтр только активных площадок по умолчанию, если не передан статус
    if (!filter.status) {
      filter.status = 'active';
    }
    
    const skip = (page - 1) * limit;
    
    const [courts, total] = await Promise.all([
      Court.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ rating: -1, createdAt: -1 }),
      Court.countDocuments(filter)
    ]);
    
    return {
      courts,
      total,
      page,
      limit
    };
  }

  /**
   * Обновление площадки
   * @param {string} courtId - ID площадки
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Court>} - Обновленная площадка
   * @throws {NotFoundError} - Если площадка не найдена
   */
  async update(courtId, updateData) {
    const court = await Court.findByIdAndUpdate(
      courtId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!court) {
      throw new NotFoundError('Court not found', 'Court', courtId);
    }
    
    return court;
  }

  /**
   * Удаление площадки
   * @param {string} courtId - ID площадки
   * @returns {Promise<boolean>} - true если удаление успешно
   * @throws {NotFoundError} - Если площадка не найдена
   */
  async delete(courtId) {
    const result = await Court.findByIdAndDelete(courtId);
    
    if (!result) {
      throw new NotFoundError('Court not found', 'Court', courtId);
    }
    
    return true;
  }

  /**
   * Поиск площадок поблизости
   * @param {number} longitude - Долгота точки
   * @param {number} latitude - Широта точки
   * @param {number} distance - Расстояние в метрах
   * @param {Object} filter - Дополнительные фильтры
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество площадок на странице
   * @returns {Promise<{courts: Court[], total: number, page: number, limit: number}>}
   */
  async findNearby(longitude, latitude, distance = 5000, filter = {}, page = 1, limit = 10) {
    // Объединяем гео-запрос с базовыми фильтрами
    const geoFilter = {
      ...filter,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance
        }
      }
    };
    
    // По умолчанию ищем только активные площадки
    if (!geoFilter.status) {
      geoFilter.status = 'active';
    }
    
    const skip = (page - 1) * limit;
    
    const courts = await Court.find(geoFilter)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });
    
    const total = await Court.countDocuments(geoFilter);
    
    return {
      courts,
      total,
      page,
      limit
    };
  }

  /**
   * Добавление отзыва к площадке
   * @param {string} courtId - ID площадки
   * @param {Object} reviewData - Данные отзыва
   * @returns {Promise<Court>} - Обновленная площадка с новым отзывом
   * @throws {NotFoundError} - Если площадка не найдена
   */
  async addReview(courtId, reviewData) {
    const court = await Court.findById(courtId);
    
    if (!court) {
      throw new NotFoundError('Court not found', 'Court', courtId);
    }
    
    court.reviews.push(reviewData);
    court.updateRating();
    
    return await court.save();
  }

  /**
   * Поиск площадок по типу спорта
   * @param {string} sportType - Тип спорта
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество площадок на странице
   * @returns {Promise<{courts: Court[], total: number, page: number, limit: number}>}
   */
  async findBySportType(sportType, page = 1, limit = 10) {
    const filter = {
      sportTypes: sportType,
      status: 'active'
    };
    
    return await this.findAll(page, limit, filter);
  }

  /**
   * Проверка доступности площадки в заданное время
   * @param {string} courtId - ID площадки
   * @param {Date} date - Дата
   * @param {string} startTime - Время начала в формате "HH:MM"
   * @param {string} endTime - Время окончания в формате "HH:MM"
   * @returns {Promise<boolean>} - true если площадка доступна
   * @throws {NotFoundError} - Если площадка не найдена
   */
  async checkAvailability(courtId, date, startTime, endTime) {
    const court = await this.findById(courtId);
    return court.isAvailable(date, startTime, endTime);
  }

  /**
   * Получение площадок, созданных пользователем
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество площадок на странице
   * @returns {Promise<{courts: Court[], total: number, page: number, limit: number}>}
   */
  async findByCreator(userId, page = 1, limit = 10) {
    const filter = { createdBy: userId };
    return await this.findAll(page, limit, filter);
  }
}

module.exports = new CourtRepository();