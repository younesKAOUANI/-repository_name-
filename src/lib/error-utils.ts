/**
 * Utility functions for error handling and reporting
 */

export interface AppError {
  code: string
  message: string
  details?: any
  statusCode?: number
}

export class CustomError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Common error types
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Data & Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // License & Access
  NO_LICENSE: 'NO_LICENSE',
  INVALID_LICENSE: 'INVALID_LICENSE',
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  
  // Quiz & Exam
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  EXAM_IN_PROGRESS: 'EXAM_IN_PROGRESS',
  EXAM_ALREADY_COMPLETED: 'EXAM_ALREADY_COMPLETED',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  
  // Network & Server
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Error messages in French
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'Vous devez être connecté pour accéder à cette ressource.',
  [ErrorCodes.FORBIDDEN]: 'Vous n\'avez pas les autorisations nécessaires pour cette action.',
  [ErrorCodes.SESSION_EXPIRED]: 'Votre session a expiré. Veuillez vous reconnecter.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Identifiants incorrects.',
  
  [ErrorCodes.VALIDATION_ERROR]: 'Les données fournies ne sont pas valides.',
  [ErrorCodes.NOT_FOUND]: 'La ressource demandée est introuvable.',
  [ErrorCodes.ALREADY_EXISTS]: 'Cette ressource existe déjà.',
  
  [ErrorCodes.NO_LICENSE]: 'Aucune licence valide trouvée. Contactez l\'administration.',
  [ErrorCodes.INVALID_LICENSE]: 'Votre licence n\'est pas valide pour cette action.',
  [ErrorCodes.LICENSE_EXPIRED]: 'Votre licence a expiré. Contactez l\'administration.',
  
  [ErrorCodes.QUIZ_NOT_FOUND]: 'Le quiz demandé est introuvable.',
  [ErrorCodes.EXAM_IN_PROGRESS]: 'Un examen est déjà en cours.',
  [ErrorCodes.EXAM_ALREADY_COMPLETED]: 'Cet examen a déjà été terminé.',
  [ErrorCodes.TIME_LIMIT_EXCEEDED]: 'Le temps imparti pour cet examen a été dépassé.',
  
  [ErrorCodes.NETWORK_ERROR]: 'Erreur de connexion. Vérifiez votre connexion internet.',
  [ErrorCodes.SERVER_ERROR]: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
  [ErrorCodes.DATABASE_ERROR]: 'Erreur de base de données. Contactez l\'assistance technique.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'Une erreur inattendue s\'est produite.'
}

/**
 * Create a standardized error
 */
export function createError(
  code: keyof typeof ErrorCodes, 
  customMessage?: string, 
  statusCode?: number,
  details?: any
): CustomError {
  const message = customMessage || ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
  const status = statusCode || getDefaultStatusCode(code)
  
  return new CustomError(message, code, status, details)
}

/**
 * Get default HTTP status code for error type
 */
function getDefaultStatusCode(code: string): number {
  switch (code) {
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.SESSION_EXPIRED:
    case ErrorCodes.INVALID_CREDENTIALS:
      return 401
    
    case ErrorCodes.FORBIDDEN:
    case ErrorCodes.NO_LICENSE:
    case ErrorCodes.INVALID_LICENSE:
    case ErrorCodes.LICENSE_EXPIRED:
      return 403
    
    case ErrorCodes.NOT_FOUND:
    case ErrorCodes.QUIZ_NOT_FOUND:
      return 404
    
    case ErrorCodes.VALIDATION_ERROR:
    case ErrorCodes.ALREADY_EXISTS:
    case ErrorCodes.EXAM_IN_PROGRESS:
    case ErrorCodes.EXAM_ALREADY_COMPLETED:
    case ErrorCodes.TIME_LIMIT_EXCEEDED:
      return 400
    
    case ErrorCodes.SERVER_ERROR:
    case ErrorCodes.DATABASE_ERROR:
      return 500
    
    case ErrorCodes.NETWORK_ERROR:
      return 503
    
    default:
      return 500
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): CustomError {
  // If it's already a CustomError, return it
  if (error instanceof CustomError) {
    return error
  }
  
  // If it's a standard Error with additional properties
  if (error instanceof Error) {
    const statusCode = (error as any).statusCode || (error as any).status || 500
    const code = (error as any).code || ErrorCodes.UNKNOWN_ERROR
    
    return new CustomError(error.message, code, statusCode, error)
  }
  
  // If it's an object with error information
  if (typeof error === 'object' && error !== null) {
    const message = error.message || error.error || 'Une erreur s\'est produite'
    const code = error.code || ErrorCodes.UNKNOWN_ERROR
    const statusCode = error.statusCode || error.status || 500
    
    return new CustomError(message, code, statusCode, error)
  }
  
  // Fallback for unknown error types
  return new CustomError(
    String(error) || 'Une erreur inconnue s\'est produite',
    ErrorCodes.UNKNOWN_ERROR,
    500,
    error
  )
}

/**
 * Log error for debugging/monitoring
 */
export function logError(error: Error | CustomError, context?: string) {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    ...(error instanceof CustomError && {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    })
  }
  
  console.error('Application Error:', errorInfo)
  
  // In production, you might want to send this to an error reporting service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorReportingService(errorInfo)
  }
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: Error | CustomError): string {
  if (error instanceof CustomError) {
    return error.message
  }
  
  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
  }
  
  return error.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
}
