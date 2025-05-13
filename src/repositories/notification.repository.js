// src/repositories/notification.repository.js
const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/errors');

/**
 * Репозиторий для работы с уведомлениями
 */
class NotificationRepository {
  /**
   * Создание нового уведомления
   * @param {Object} notificationData - Данные уведомления
   * @returns {Promise<Notification>} - Созданное уведомление
   */
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  /**
   * Получение уведомления по ID
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<Notification>} - Найденное уведомление
   * @throws {NotFoundError} - Если уведомление не найдено
   */
  async findById(notificationId) {
    const notification = await Notification.findById(notificationId)
      .populate('game', 'dateTime sportType status')
      .populate('court', 'name location')
      .populate('sender', 'username avatar');
    
    if (!notification) {
      throw new NotFoundError('Notification not found', 'Notification', notificationId);
    }
    
    return notification;
  }

  /**
   * Получение уведомлений пользователя с пагинацией
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество уведомлений на странице
   * @param {boolean} onlyUnread - Только непрочитанные уведомления
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findUserNotifications(userId, page = 1, limit = 10, onlyUnread = false) {
    const skip = (page - 1) * limit;
    
    // Базовый фильтр по получателю и дате отправки
    const filter = {
      recipient: userId,
      scheduledFor: { $lte: new Date() }
    };
    
    // Добавляем фильтр непрочитанных, если нужно
    if (onlyUnread) {
      filter.isRead = false;
    }
    
    // Добавляем проверку на срок действия
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];
    
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('game', 'dateTime sportType status')
        .populate('court', 'name location')
        .populate('sender', 'username avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(filter)
    ]);
    
    return {
      notifications,
      total,
      page,
      limit
    };
  }
  
  /**
   * Получение непрочитанных уведомлений пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Notification[]>} - Список непрочитанных уведомлений
   */
  async findUnreadNotifications(userId) {
    return await Notification.getUnreadForUser(userId);
  }

  /**
   * Подсчет непрочитанных уведомлений пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<number>} - Количество непрочитанных уведомлений
   */
  async countUnreadNotifications(userId) {
    const filter = {
      recipient: userId,
      isRead: false,
      scheduledFor: { $lte: new Date() },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    return await Notification.countDocuments(filter);
  }

  /**
   * Пометить уведомление как прочитанное
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<Notification>} - Обновленное уведомление
   * @throws {NotFoundError} - Если уведомление не найдено
   */
  async markAsRead(notificationId) {
    const notification = await this.findById(notificationId);
    return await notification.markAsRead();
  }

  /**
   * Пометить все уведомления пользователя как прочитанные
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Результат операции
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );
    
    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Удаление уведомления
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<boolean>} - true если удаление успешно
   * @throws {NotFoundError} - Если уведомление не найдено
   */
  async delete(notificationId) {
    const result = await Notification.findByIdAndDelete(notificationId);
    
    if (!result) {
      throw new NotFoundError('Notification not found', 'Notification', notificationId);
    }
    
    return true;
  }

  /**
   * Создание группы уведомлений для всех участников игры
   * @param {Object} game - Игра
   * @param {string} type - Тип уведомления
   * @param {string} title - Заголовок уведомления
   * @param {string} message - Текст уведомления
   * @param {Object} data - Дополнительные данные
   * @param {string} excludeUser - ID пользователя, который не должен получить уведомление
   * @returns {Promise<Notification[]>} - Созданные уведомления
   */
  async notifyGameParticipants(game, type, title, message, data = {}, excludeUser = null) {
    return await Notification.notifyGameParticipants(game, type, title, message, data, excludeUser);
  }

  /**
   * Создание отложенного уведомления
   * @param {Object} notificationData - Данные уведомления
   * @param {Date} scheduledFor - Дата отправки
   * @param {Date} expiresAt - Дата истечения
   * @returns {Promise<Notification>} - Созданное уведомление
   */
  async scheduleNotification(notificationData, scheduledFor, expiresAt = null) {
    const notification = new Notification({
      ...notificationData,
      scheduledFor,
      expiresAt
    });
    
    return await notification.save();
  }

  /**
   * Создание напоминания о предстоящей игре
   * @param {Object} game - Игра
   * @param {number} minutesBefore - За сколько минут до игры отправить напоминание
   * @returns {Promise<Notification[]>} - Созданные уведомления
   */
  async createGameReminders(game, minutesBefore = 60) {
    const notifications = [];
    const gameDate = new Date(game.dateTime);
    
    // Вычисляем время отправки напоминания
    const scheduledFor = new Date(gameDate);
    scheduledFor.setMinutes(scheduledFor.getMinutes() - minutesBefore);
    
    // Если время отправки уже прошло, не создаем напоминания
    if (scheduledFor <= new Date()) {
      return [];
    }
    
    // Для каждого участника игры создаем отложенное уведомление
    for (const player of game.currentPlayers) {
      const notification = await this.scheduleNotification(
        {
          recipient: player.user,
          sender: game.creator,
          game: game._id,
          court: game.court,
          type: 'game_reminder',
          title: 'Напоминание о игре',
          message: `Напоминаем, что через ${minutesBefore} минут начнется игра ${game.sportType} на площадке ${game.court.name}`,
          data: {
            gameId: game._id,
            sportType: game.sportType,
            dateTime: game.dateTime
          }
        },
        scheduledFor,
        gameDate // Срок действия - до начала игры
      );
      
      notifications.push(notification);
    }
    
    return notifications;
  }
}

module.exports = new NotificationRepository();