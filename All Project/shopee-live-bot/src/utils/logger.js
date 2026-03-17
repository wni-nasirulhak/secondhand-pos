const winston = require('winston');
const colors = require('colors');

const logger = winston.createLogger({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      const coloredLevel = {
        error: level.red.bold,
        warn: level.yellow.bold,
        info: level.green.bold,
        debug: level.blue.bold
      }[level] || level;
      
      return `[${timestamp}] ${coloredLevel}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
