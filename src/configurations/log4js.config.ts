import log4js from 'log4js';
import { config } from './app.config';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    infoFile: {
      type: 'file',
      filename: 'logs/app-info.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true
    },
    traceDebugFile: {
      type: 'file',
      filename: 'logs/app-trace-debug.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true
    }
  },
  categories: {
    default: { appenders: ['console', 'infoFile'], level: 'info' },
    traceDebug: { appenders: ['console', 'traceDebugFile'], level: 'trace' }
  }
});

export const Logger = log4js.getLogger();

// Adjust the logger level based on config.debug
Logger.level = config.logLevel;

