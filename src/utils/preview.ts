import crypto from 'node:crypto';

export const PREVIEW_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export const createPreviewToken = (): string => crypto.randomBytes(32).toString('hex');

export const isPreviewToken = (value: unknown): value is string =>
    typeof value === 'string' && PREVIEW_TOKEN_PATTERN.test(value);

export const isPublishedStatus = (status: unknown): boolean =>
    status === true || status === 1 || status === '1';
