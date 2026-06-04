type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const shouldLogDebug = process.env.LOG_LEVEL === "debug";

function write(level: LogLevel, message: string, context: LogContext = {}) {
  if (level === "debug" && !shouldLogDebug) return;

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: "global-food-beverage-intelligence",
    ...context,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

export type { LogContext };
