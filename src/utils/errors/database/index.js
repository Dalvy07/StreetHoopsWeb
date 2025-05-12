// src/utils/errors/database/index.js
const DatabaseError = require('./DatabaseError');
const ConnectionError = require('./ConnectionError');
const QueryError = require('./QueryError');

module.exports = {
  DatabaseError,
  ConnectionError,
  QueryError,
};