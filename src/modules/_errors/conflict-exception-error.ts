export class ConflictExceptionError extends Error {
  constructor(message?: string) {
    super(message ?? 'Conflict')
  }
}
