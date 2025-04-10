const enableLogs = process.env.ENABLE_LOGS !== "false";

const emojiPrefix = {
  INFO: "🔵",
  WARN: "🟡",
  ERROR: "🔴",
  DEBUG: "🔍",
};

const log = (level, message, data = null) => {
  if (!enableLogs) return;

  const emoji = emojiPrefix[level] || "";
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: `${emoji} ${message}`,
  };

  if (data) {
    logEntry.data = data;
  }

  console.log(JSON.stringify(logEntry, null, 2));
};

const logger = {
  info: (message, data = null) => log("INFO", message, data),
  warn: (message, data = null) => log("WARN", message, data),
  error: (message, data = null) => log("ERROR", message, data),
  debug: (message, data = null) => log("DEBUG", message, data),
};

module.exports = logger;
