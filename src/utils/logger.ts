type LogContext = Record<string, unknown>;

function format(message: string, context?: LogContext): string {
  return context ? `${message} ${JSON.stringify(context)}` : message;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${format(message, context)}`);
  },
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${format(message, context)}`);
  },
  error(message: string, context?: LogContext): void {
    console.error(`[ERROR] ${format(message, context)}`);
  },
};
