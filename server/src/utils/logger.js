// Paprastas centralizuotas logger'is: klaidos ir įspėjimai rašomi į konsolę
// vienodu formatu, kad nė viena klaida nebūtų nutylima.

function write(method, level, message, details) {
  if (details === undefined) {
    console[method](`[${level}] ${message}`)
  } else {
    console[method](`[${level}] ${message}`, details)
  }
}

const logger = {
  error: (message, details) => write('error', 'ERROR', message, details),
  warn: (message, details) => write('warn', 'WARN', message, details),
  info: (message, details) => write('info', 'INFO', message, details),
}

export default logger
