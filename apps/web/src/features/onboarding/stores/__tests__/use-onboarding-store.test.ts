import { act } from '@testing-library/react';

import { registerPreferencesAPI } from '../../api/onboarding.api';
import type { PreferencesRequest } from '../../types/onboarding.type';
import { useOnboardingStore } from '../use-onboarding-store';

// ─── Mocks ────────────────────────────────────────────────────────────
jest.mock('../../api/onboarding.api', () => ({
  registerPreferencesAPI: jest.fn(),
}));

jest.mock('@repo/shared/utils', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  isLocalStorageAvailable: jest.fn(() => false),
}));

const mockedRegisterPreferencesAPI = registerPreferencesAPI as jest.MockedFunction<
  typeof registerPreferencesAPI
>;

// ─── Test Data ────────────────────────────────────────────────────────
const mockPreferencesRequest: PreferencesRequest = {
  healthCareInterests: ['GYNECOLOGY_QNA'],
  gynecologyInterests: ['MENSTRUAL_PAIN'],
  hasVisited: false,
  hospitalPriorities: ['FEMALE_DOCTOR'],
  communityInterests: ['COMMUNITY'],
  commerceInterests: ['PRODUCT_SEARCH'],
  productCategories: ['TAMPON'],
};

// ─── Tests ────────────────────────────────────────────────────────────
describe('useOnboardingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    act(() => {
      useOnboardingStore.getState().resetOnboarding();
    });
  });

  describe('initial state', () => {
    it('has empty nickname', () => {
      expect(useOnboardingStore.getState().nickname).toBe('');
    });

    it('has age 0', () => {
      expect(useOnboardingStore.getState().age).toBe(0);
    });

    it('has empty birthDateSelection', () => {
      expect(useOnboardingStore.getState().birthDateSelection).toEqual({
        year: '',
        month: '',
        day: '',
      });
    });

    it('has empty preferences', () => {
      expect(useOnboardingStore.getState().preferences).toEqual({
        healthCareInterests: [],
        gynecologyInterests: [],
        hasVisited: null,
        hospitalPriorities: [],
        communityInterests: [],
        commerceInterests: [],
        productCategories: [],
      });
    });
  });

  describe('setNickname', () => {
    it('updates the nickname', () => {
      act(() => {
        useOnboardingStore.getState().setNickname('luna');
      });
      expect(useOnboardingStore.getState().nickname).toBe('luna');
    });
  });

  describe('setAge', () => {
    it('updates the age', () => {
      act(() => {
        useOnboardingStore.getState().setAge(25);
      });
      expect(useOnboardingStore.getState().age).toBe(25);
    });
  });

  describe('setPreferences', () => {
    it('partially updates preferences', () => {
      act(() => {
        useOnboardingStore.getState().setPreferences({ healthCareInterests: ['GYNECOLOGY_QNA'] });
      });
      const { preferences } = useOnboardingStore.getState();
      expect(preferences.healthCareInterests).toEqual(['GYNECOLOGY_QNA']);
      expect(preferences.communityInterests).toEqual([]);
    });

    it('does not overwrite unrelated fields', () => {
      act(() => {
        useOnboardingStore.getState().setPreferences({ communityInterests: ['COMMUNITY'] });
        useOnboardingStore.getState().setPreferences({ commerceInterests: ['PRODUCT_SEARCH'] });
      });
      const { preferences } = useOnboardingStore.getState();
      expect(preferences.communityInterests).toEqual(['COMMUNITY']);
      expect(preferences.commerceInterests).toEqual(['PRODUCT_SEARCH']);
    });
  });

  describe('setBirthDateSelection', () => {
    it('updates the birth date selection', () => {
      const selection = { year: '2000', month: '06', day: '15' };
      act(() => {
        useOnboardingStore.getState().setBirthDateSelection(selection);
      });
      expect(useOnboardingStore.getState().birthDateSelection).toEqual(selection);
    });
  });

  describe('resetOnboarding', () => {
    it('resets all state to initial values', () => {
      act(() => {
        useOnboardingStore.getState().setNickname('test');
        useOnboardingStore.getState().setAge(30);
        useOnboardingStore.getState().setBirthDateSelection({
          year: '1990',
          month: '01',
          day: '01',
        });
      });

      act(() => {
        useOnboardingStore.getState().resetOnboarding();
      });

      const state = useOnboardingStore.getState();
      expect(state.nickname).toBe('');
      expect(state.age).toBe(0);
      expect(state.birthDateSelection).toEqual({ year: '', month: '', day: '' });
      expect(state.preferences).toEqual({
        healthCareInterests: [],
        gynecologyInterests: [],
        hasVisited: null,
        hospitalPriorities: [],
        communityInterests: [],
        commerceInterests: [],
        productCategories: [],
      });
    });
  });

  describe('submitPreferences', () => {
    it('calls registerPreferencesAPI and resets store on success', async () => {
      mockedRegisterPreferencesAPI.mockResolvedValue('OK');

      act(() => {
        useOnboardingStore.getState().setNickname('testuser');
        useOnboardingStore.getState().setAge(25);
      });

      await act(async () => {
        await useOnboardingStore.getState().submitPreferences(mockPreferencesRequest);
      });

      expect(mockedRegisterPreferencesAPI).toHaveBeenCalledWith(mockPreferencesRequest);

      const state = useOnboardingStore.getState();
      expect(state.nickname).toBe('');
      expect(state.age).toBe(0);
    });

    it('does not reset store when registerPreferencesAPI fails', async () => {
      mockedRegisterPreferencesAPI.mockRejectedValue(new Error('fail'));

      act(() => {
        useOnboardingStore.getState().setNickname('keepme');
      });

      try {
        await act(async () => {
          await useOnboardingStore.getState().submitPreferences(mockPreferencesRequest);
        });
      } catch {
        // expected
      }

      expect(useOnboardingStore.getState().nickname).toBe('keepme');
    });

    it('propagates errors thrown by registerPreferencesAPI', async () => {
      mockedRegisterPreferencesAPI.mockRejectedValue(new Error('Network failure'));

      await expect(
        act(async () => {
          await useOnboardingStore.getState().submitPreferences(mockPreferencesRequest);
        }),
      ).rejects.toThrow('Network failure');
    });
  });
});
