export class ErrorInternal extends Error {
  status = 500
  message = 'Internal Server Error'
  constructor(message?: string, status?: number) {
    super()
    if (message) this.message = message
    if (status) this.status = status
  }
}

export class ErrorBadRequest extends ErrorInternal {
  status = 400
  message = 'Bad Request'
}

export class ErrorUnauthorized extends ErrorInternal {
  status = 401
  message = 'Unauthorized'
}

export class ErrorNotFound extends ErrorInternal {
  status = 404
  message = 'Not Found'
}
