import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";
import DailyRotateFile from "winston-daily-rotate-file";

function generatorTransportOptions(level: string, option: DailyRotateFile.DailyRotateFileTransportOptions = {}) {
  return new winston.transports.DailyRotateFile(Object.assign({
    dirname: "logs",
    filename: `${level}.%DATE%.log`,
    level,
    prepend: true,
    json: true,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '50m',
    maxFiles: '7d',
    format: winston.format.combine(
      winston.format.json()
    ),
  }, option))
}

export const loggerConfig: WinstonModuleOptions = {
  level: "info",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    polarisError: 3,
    polarisInfo: 4,
    http: 5,
    verbose: 6,
    debug: 7,
    silly: 8,
  },
  format: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  defaultMeta: { service: 'user-service' },
  transports: [
    generatorTransportOptions("info"),
    generatorTransportOptions("error")
  ]
}