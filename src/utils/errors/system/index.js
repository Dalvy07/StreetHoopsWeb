// src/utils/errors/system/index.js
const SystemError = require('./SystemError');
const ConfigError = require('./ConfigError');
const FileSystemError = require('./FileSystemError');
const NetworkError = require('./NetworkError');

module.exports = {
  SystemError,
  ConfigError,
  FileSystemError,
  NetworkError
};