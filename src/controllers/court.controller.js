// src/controllers/court.controller.js
const courtService = require('../services/court.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/asyncHandler');

/**
 * Контроллер для работы с площадками
 */
const courtController = {
  /**
   * Создание новой площадки
   * @route POST /api/v1/courts
   * @access Private (только администраторы)
   */
  createCourt: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Проверяем, что пользователь - администратор
    if (userRole !== 'admin') {
      return res.status(403).json(ApiResponse.forbidden('Only administrators can create courts'));
    }

    const courtData = { ...req.body, createdBy: userId };
    const newCourt = await courtService.createCourt(courtData);

    res.status(201).json(ApiResponse.created(newCourt, 'Court created successfully'));
  }),

  /**
   * Получение всех площадок с пагинацией и фильтрацией
   * @route GET /api/v1/courts
   * @access Public
   */
  getAllCourts: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sportType, status = 'active' } = req.query;
    const filter = { status };
    
    if (sportType) {
      filter.sportTypes = sportType;
    }

    const courts = await courtService.getAllCourts(page, limit, filter);

    res.json(ApiResponse.paginated(
      courts.courts,
      courts.page,
      courts.limit,
      courts.total,
      'Courts retrieved successfully'
    ));
  }),

  /**
   * Получение площадок поблизости
   * @route GET /api/v1/courts/nearby
   * @access Public
   */
  getNearbyCourts: asyncHandler(async (req, res) => {
    const { longitude, latitude, distance = 5000, page = 1, limit = 10, sportType } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json(ApiResponse.badRequest('Longitude and latitude are required'));
    }

    const filter = {};
    if (sportType) {
      filter.sportTypes = sportType;
    }

    const courts = await courtService.getNearbyCourts(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(distance),
      filter,
      parseInt(page),
      parseInt(limit)
    );

    res.json(ApiResponse.paginated(
      courts.courts,
      courts.page,
      courts.limit,
      courts.total,
      'Nearby courts retrieved successfully'
    ));
  }),

  /**
   * Получение площадки по ID
   * @route GET /api/v1/courts/:id
   * @access Public
   */
  getCourtById: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const court = await courtService.getCourtById(courtId);

    res.json(ApiResponse.success(court, 'Court retrieved successfully'));
  }),

  /**
   * Обновление площадки
   * @route PUT /api/v1/courts/:id
   * @access Private (только администраторы)
   */
  updateCourt: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const userRole = req.user.role;
    const updateData = req.body;

    const updatedCourt = await courtService.updateCourt(courtId, updateData, userRole);

    res.json(ApiResponse.updated(updatedCourt, 'Court updated successfully'));
  }),

  /**
   * Удаление площадки
   * @route DELETE /api/v1/courts/:id
   * @access Private (только администраторы)
   */
  deleteCourt: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const userRole = req.user.role;

    await courtService.deleteCourt(courtId, userRole);

    res.json(ApiResponse.deleted('Court deleted successfully'));
  }),

  /**
   * Добавление отзыва к площадке
   * @route POST /api/v1/courts/:id/reviews
   * @access Private
   */
  addReview: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const userId = req.user.id;
    const { text, rating } = req.body;

    const reviewData = {
      user: userId,
      text,
      rating
    };

    const updatedCourt = await courtService.addReview(courtId, reviewData);

    res.status(201).json(ApiResponse.created(
      updatedCourt.reviews[updatedCourt.reviews.length - 1], 
      'Review added successfully'
    ));
  }),

  /**
   * Получение игр на площадке
   * @route GET /api/v1/courts/:id/games
   * @access Public
   */
  getCourtGames: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const { page = 1, limit = 10, fromDate, toDate } = req.query;

    const games = await courtService.getCourtGames(
      courtId, 
      parseInt(page), 
      parseInt(limit),
      fromDate ? new Date(fromDate) : new Date(),
      toDate ? new Date(toDate) : null
    );

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'Court games retrieved successfully'
    ));
  }),

  /**
   * Получение площадок, созданных пользователем
   * @route GET /api/v1/courts/my-courts
   * @access Private
   */
  getMyCourts: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const courts = await courtService.getUserCourts(userId, parseInt(page), parseInt(limit));

    res.json(ApiResponse.paginated(
      courts.courts,
      courts.page,
      courts.limit,
      courts.total,
      'Your courts retrieved successfully'
    ));
  }),

  /**
   * Проверка доступности площадки
   * @route GET /api/v1/courts/:id/availability
   * @access Public
   */
  checkAvailability: asyncHandler(async (req, res) => {
    const courtId = req.params.id;
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json(ApiResponse.badRequest('Date, startTime, and endTime are required'));
    }

    const isAvailable = await courtService.checkAvailability(
      courtId,
      new Date(date),
      startTime,
      endTime
    );

    res.json(ApiResponse.success(
      { available: isAvailable },
      isAvailable ? 'Court is available' : 'Court is not available'
    ));
  })
};

module.exports = courtController;