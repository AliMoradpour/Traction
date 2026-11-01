/// <reference types="jest" />
import { parseApiError } from '../errors';
import { isPermanentFeedbackError } from '../feedback';
import { normalizeApiError } from '../interceptors';

jest.mock('expo-secure-store', () => ({}));
jest.mock('@/lib/config', () => ({ __esModule: true, default: { apiUrl: 'http://test' } }));

const httpError = (status: number, data: unknown) => ({ response: { status, data } });

describe('normalizeApiError', () => {
  it('translates a NestJS error body and keeps the status', () => {
    const e = normalizeApiError(
      httpError(401, { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' }),
    );
    expect(e.status).toBe(401);
    expect(e.message).toBe('Invalid credentials');
    expect(e.error).toMatchObject({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    expect(parseApiError(e)).toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
      message: 'Invalid credentials',
    });
  });

  it('joins class-validator message arrays', () => {
    const e = normalizeApiError(
      httpError(400, {
        statusCode: 400,
        message: ['email must be an email', 'password too short'],
        error: 'Bad Request',
      }),
    );
    expect(e.error.code).toBe('VALIDATION_ERROR');
    expect(e.message).toBe('email must be an email\npassword too short');
  });

  it('classifies network failures and timeouts', () => {
    expect(normalizeApiError({ message: 'Network Error' }).error.code).toBe('NETWORK_ERROR');
    expect(normalizeApiError({ code: 'ECONNABORTED' }).error.code).toBe('TIMEOUT');
  });
});

describe('isPermanentFeedbackError', () => {
  it('drops only payload rejections, keeps retrying transient failures', () => {
    expect(isPermanentFeedbackError(normalizeApiError(httpError(400, { message: 'bad' })))).toBe(
      true,
    );
    expect(isPermanentFeedbackError(normalizeApiError(httpError(401, { message: 'x' })))).toBe(
      false,
    );
    expect(isPermanentFeedbackError(normalizeApiError(httpError(429, { message: 'x' })))).toBe(
      false,
    );
    expect(isPermanentFeedbackError(normalizeApiError(httpError(503, { message: 'x' })))).toBe(
      false,
    );
    expect(isPermanentFeedbackError(normalizeApiError({ message: 'Network Error' }))).toBe(false);
  });
});
