import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth-context';

const push = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

type AuthState = ReturnType<typeof useAuth>;

function setAuth(state: {
  user: object | null;
  loading: boolean;
  isAdmin: boolean;
}): void {
  vi.mocked(useAuth).mockReturnValue(state as AuthState);
}

function renderGuard() {
  return render(
    <AuthGuard>
      <p>Admin dashboard</p>
    </AuthGuard>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('AuthGuard', () => {
  it('shows a spinner while loading, without children or redirect', () => {
    setAuth({ user: null, loading: true, isAdmin: false });

    const { container } = renderGuard();

    expect(container.querySelector('.animate-spin')).not.toBeNull();
    expect(screen.queryByText('Admin dashboard')).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('renders nothing and redirects to /login when there is no user', () => {
    setAuth({ user: null, loading: false, isAdmin: false });

    const { container } = renderGuard();

    expect(container).toBeEmptyDOMElement();
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('redirects a signed-in non-admin user to /login', () => {
    setAuth({ user: { uid: 'someone' }, loading: false, isAdmin: false });

    const { container } = renderGuard();

    expect(container).toBeEmptyDOMElement();
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('renders children for the admin without redirecting', () => {
    setAuth({ user: { uid: 'admin' }, loading: false, isAdmin: true });

    renderGuard();

    expect(screen.getByText('Admin dashboard')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
