import { renderHook } from '@testing-library/react';

import { toast } from '@web/components/ui/toast';

import { useOnboardingComplete, useOnboardingNavigationGuard } from '../use-onboarding-navigation';

// ─── Mocks ────────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@repo/shared/constants', () => ({
  ROUTES: {
    ONBOARDING_NAME: '/onboarding/name',
    ONBOARDING_AGE: '/onboarding/age',
    ONBOARDING_PREFERENCES: '/onboarding/preferences',
    ROOT: '/',
  },
}));

jest.mock('@repo/shared/utils', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@web/components/ui/toast', () => ({
  toast: {
    warning: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockedToastWarning = toast.warning as jest.Mock;

// ─── Tests ────────────────────────────────────────────────────────────
describe('useOnboardingNavigationGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to ONBOARDING_NAME when nickname is required but missing', () => {
    renderHook(() => useOnboardingNavigationGuard({ requireNickname: true, nickname: '' }));

    expect(mockPush).toHaveBeenCalledWith('/onboarding/name');
    expect(mockedToastWarning).toHaveBeenCalledWith('이전 단계가 완료되지 않았어요!');
  });

  it('redirects to ONBOARDING_AGE when age is required but missing', () => {
    renderHook(() =>
      useOnboardingNavigationGuard({
        requireNickname: true,
        requireAge: true,
        nickname: 'luna',
        age: 0,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith('/onboarding/age');
  });

  it('does not redirect when all required fields are present', () => {
    renderHook(() =>
      useOnboardingNavigationGuard({
        requireNickname: true,
        requireAge: true,
        nickname: 'luna',
        age: 25,
      }),
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when no requirements are set', () => {
    renderHook(() => useOnboardingNavigationGuard({}));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('checks nickname requirement only when requireNickname is true', () => {
    renderHook(() => useOnboardingNavigationGuard({ requireNickname: false, nickname: '' }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('checks age requirement only when requireAge is true', () => {
    renderHook(() =>
      useOnboardingNavigationGuard({
        requireNickname: true,
        requireAge: false,
        nickname: 'luna',
        age: 0,
      }),
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── useOnboardingComplete ────────────────────────────────────────────
describe('useOnboardingComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to ROOT when completeOnboarding is called', () => {
    const { result } = renderHook(() => useOnboardingComplete());

    result.current.completeOnboarding();

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
