/** Errors the API turns into `{ error: { code, message, details? } }` with the given HTTP status. */
export class AppError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly details?: unknown) {
    super(message);
  }
}
export const notFound = (what = 'Recurso') => new AppError(404, 'not_found', `${what} não encontrado.`);
export const forbidden = (msg = 'Sem permissão para esta ação.') => new AppError(403, 'forbidden', msg);
export const unauthorized = () => new AppError(401, 'unauthorized', 'Entre com sua conta para continuar.');
export const invalid = (msg: string, details?: unknown) => new AppError(422, 'invalid', msg, details);
