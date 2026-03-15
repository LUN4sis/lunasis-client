import { act, renderHook } from '@testing-library/react';

import { ErrorCode } from '@repo/shared/types';
import { toast } from '@web/components/ui/toast';

import { getRandomNickname } from '../../actions/onboarding.actions';
import { validate } from '../../utils/validation.utils';
import { useNicknameValidation } from '../use-onboarding-validation';

// ─── Mocks ────────────────────────────────────────────────────────────
const mockSetNickname = jest.fn();
let mockNickname = '';

jest.mock('../../stores/use-onboarding-store', () => ({
  useOnboardingStore: (selector: (s: unknown) => unknown) =>
    selector({
      nickname: mockNickname,
      setNickname: mockSetNickname,
    }),
}));

jest.mock('../../actions/onboarding.actions', () => ({
  getRandomNickname: jest.fn(),
}));

jest.mock('../../schemas/validation.schemas', () => ({
  nicknameSchema: {},
}));

jest.mock('../../utils/validation.utils', () => ({
  validate: jest.fn(),
}));

jest.mock('@web/components/ui/toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockedGetRandomNickname = getRandomNickname as jest.MockedFunction<typeof getRandomNickname>;
const mockedValidate = validate as jest.MockedFunction<typeof validate>;
const mockedToastError = toast.error as jest.Mock;

// ─── Tests ────────────────────────────────────────────────────────────
describe('useNicknameValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNickname = '';
    mockedValidate.mockReturnValue({ isValid: true, error: null });
  });

  describe('initial state', () => {
    it('isValid is true initially', () => {
      const { result } = renderHook(() => useNicknameValidation());
      expect(result.current.isValid).toBe(true);
    });

    it('error is null initially', () => {
      const { result } = renderHook(() => useNicknameValidation());
      expect(result.current.error).toBeNull();
    });

    it('isLoading is false initially', () => {
      const { result } = renderHook(() => useNicknameValidation());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleNicknameChange', () => {
    it('calls setNickname with new value', () => {
      const { result } = renderHook(() => useNicknameValidation());

      act(() => {
        result.current.handleNicknameChange('luna');
      });

      expect(mockSetNickname).toHaveBeenCalledWith('luna');
    });

    it('updates isValid based on validation result', () => {
      mockedValidate.mockReturnValue({
        isValid: false,
        error: '닉네임은 최소 2자 이상이어야 합니다.',
      });

      const { result } = renderHook(() => useNicknameValidation());

      act(() => {
        result.current.handleNicknameChange('a');
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe('닉네임은 최소 2자 이상이어야 합니다.');
    });
  });

  describe('validateNickname', () => {
    it('returns true when validation passes', () => {
      mockedValidate.mockReturnValue({ isValid: true, error: null });

      const { result } = renderHook(() => useNicknameValidation());

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateNickname();
      });

      expect(isValid!).toBe(true);
    });

    it('returns false and sets error when validation fails', () => {
      mockedValidate.mockReturnValue({ isValid: false, error: '닉네임을 입력해주세요.' });

      const { result } = renderHook(() => useNicknameValidation());

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateNickname();
      });

      expect(isValid!).toBe(false);
      expect(result.current.error).toBe('닉네임을 입력해주세요.');
    });
  });

  describe('fetchRecommendedNickname', () => {
    it('sets nickname from API response on success', async () => {
      mockedGetRandomNickname.mockResolvedValue({
        success: true,
        data: { randomNickname: 'LunaUser' },
      });

      const { result } = renderHook(() => useNicknameValidation());

      await act(async () => {
        await result.current.fetchRecommendedNickname();
      });

      expect(mockSetNickname).toHaveBeenCalledWith('LunaUser');
    });

    it('sets isLoading=true during fetch and false after', async () => {
      let resolvePromise!: (
        v: ReturnType<typeof mockedGetRandomNickname> extends Promise<infer R> ? R : never,
      ) => void;
      mockedGetRandomNickname.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve as typeof resolvePromise;
          }),
      );

      const { result } = renderHook(() => useNicknameValidation());

      act(() => {
        result.current.fetchRecommendedNickname();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise({ success: true, data: { randomNickname: 'LunaUser' } });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('shows toast error when API throws', async () => {
      mockedGetRandomNickname.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useNicknameValidation());

      await act(async () => {
        await result.current.fetchRecommendedNickname();
      });

      expect(mockedToastError).toHaveBeenCalledWith(
        '닉네임 추천을 불러오지 못했습니다. 다시 시도해주세요.',
      );
      expect(result.current.isLoading).toBe(false);
    });

    it('does not set nickname when API returns success=false', async () => {
      mockedGetRandomNickname.mockResolvedValue({
        success: false,
        error: { code: ErrorCode.UNKNOWN_ERROR, message: '오류' },
      });

      const { result } = renderHook(() => useNicknameValidation());

      await act(async () => {
        await result.current.fetchRecommendedNickname();
      });

      expect(mockSetNickname).not.toHaveBeenCalled();
    });
  });
});
