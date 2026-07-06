import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assertAdmin } from '@/lib/auth-utils';
import { adminAuth } from '@/lib/firebase-admin';

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}));

const verifyIdToken = vi.mocked(adminAuth.verifyIdToken);

const ADMIN_UID = 'admin-uid';

function requestWithAuth(header?: string): NextRequest {
  return new NextRequest('http://test', {
    headers: header ? { authorization: header } : undefined,
  });
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_ADMIN_UID', ADMIN_UID);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('assertAdmin', () => {
  it('returns 401 when the Authorization header is missing', async () => {
    const response = await assertAdmin(requestWithAuth());

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns 401 when the header is not in Bearer format', async () => {
    const response = await assertAdmin(requestWithAuth('Token abc123'));

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification throws', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('bad token'));

    const response = await assertAdmin(requestWithAuth('Bearer bad-token'));

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: 'Invalid token',
    });
  });

  it('returns 403 when the token belongs to a non-admin user', async () => {
    verifyIdToken.mockResolvedValueOnce({
      uid: 'someone-else',
    } as Awaited<ReturnType<typeof verifyIdToken>>);

    const response = await assertAdmin(requestWithAuth('Bearer valid-token'));

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ error: 'Forbidden' });
  });

  it('returns null for a valid admin token', async () => {
    verifyIdToken.mockResolvedValueOnce({
      uid: ADMIN_UID,
    } as Awaited<ReturnType<typeof verifyIdToken>>);

    const response = await assertAdmin(requestWithAuth('Bearer valid-token'));

    expect(response).toBeNull();
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
  });
});
