import { ErrorCode } from '@repo/shared/types';

import { registerPreferencesAPI } from '../../api/onboarding.api';
import {
  COMMERCE_PREFERENCES,
  COMMUNITY_PREFERENCES,
  FEMININE_CARE_PREFERENCES,
  GYNECOLOGY_PREFERENCES,
  HEALTH_CARE_PREFERENCES,
  HOSPITAL_PRIORITIES,
} from '../../constants/onboarding.constants';
import type { PreferencesRequest } from '../../types/onboarding.type';
import { registerPreferences } from '../onboarding.actions';

// ─── Mocks ────────────────────────────────────────────────────────────
jest.mock('../../api/onboarding.api', () => ({
  getRandomNicknameAPI: jest.fn(),
  registerUserAPI: jest.fn(),
  registerPreferencesAPI: jest.fn(),
}));

jest.mock('@repo/shared/utils', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  handleError: jest.fn(),
  transformError: jest.fn((e: unknown) => e),
}));

const mockedRegisterPreferencesAPI = registerPreferencesAPI as jest.MockedFunction<
  typeof registerPreferencesAPI
>;

// ─── Test Data ────────────────────────────────────────────────────────
function validPreferencesRequest(): PreferencesRequest {
  return {
    healthCareInterests: [HEALTH_CARE_PREFERENCES[0].id],
    gynecologyInterests: [GYNECOLOGY_PREFERENCES[0].id],
    hasVisited: false,
    hospitalPriorities: [HOSPITAL_PRIORITIES[0].id],
    communityInterests: [COMMUNITY_PREFERENCES[0].id],
    commerceInterests: [COMMERCE_PREFERENCES[0].id],
    productCategories: [FEMININE_CARE_PREFERENCES[0].id],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────
describe('registerPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns success response when data is valid and API succeeds', async () => {
    mockedRegisterPreferencesAPI.mockResolvedValue('OK');

    const result = await registerPreferences(validPreferencesRequest());

    expect(result).toEqual({
      success: true,
      data: 'OK',
    });
    expect(mockedRegisterPreferencesAPI).toHaveBeenCalledWith(validPreferencesRequest());
  });

  it('returns validation error when data has invalid IDs', async () => {
    const invalidData: PreferencesRequest = {
      ...validPreferencesRequest(),
      healthCareInterests: ['INVALID_ID'],
    };

    const result = await registerPreferences(invalidData);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(mockedRegisterPreferencesAPI).not.toHaveBeenCalled();
  });

  it('returns validation error when hasVisited is not boolean', async () => {
    const invalidData = {
      ...validPreferencesRequest(),
      hasVisited: 'yes' as unknown as boolean,
    };

    const result = await registerPreferences(invalidData as PreferencesRequest);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(mockedRegisterPreferencesAPI).not.toHaveBeenCalled();
  });

  it('returns error response when API throws', async () => {
    mockedRegisterPreferencesAPI.mockRejectedValue(new Error('Network Error'));

    const result = await registerPreferences(validPreferencesRequest());

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.error?.message).toBe('Network Error');
  });

  it('returns error response for non-Error thrown values', async () => {
    mockedRegisterPreferencesAPI.mockRejectedValue({ status: 500 });

    const result = await registerPreferences(validPreferencesRequest());

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('passes parsed (validated) data to the API, not raw input', async () => {
    mockedRegisterPreferencesAPI.mockResolvedValue('OK');

    await registerPreferences(validPreferencesRequest());

    // The API should have been called with the data - ensuring schema parsing happened
    expect(mockedRegisterPreferencesAPI).toHaveBeenCalledTimes(1);
    const calledWith = mockedRegisterPreferencesAPI.mock.calls[0][0];
    expect(calledWith.healthCareInterests).toEqual(validPreferencesRequest().healthCareInterests);
  });

  it('accepts empty arrays for optional sub-section fields', async () => {
    // gynecologyInterests, hospitalPriorities, productCategories are conditionally shown
    // and may legitimately be empty. Required fields must have at least one value.
    const data: PreferencesRequest = {
      healthCareInterests: validPreferencesRequest().healthCareInterests,
      gynecologyInterests: [],
      hasVisited: false,
      hospitalPriorities: [],
      communityInterests: validPreferencesRequest().communityInterests,
      commerceInterests: validPreferencesRequest().commerceInterests,
      productCategories: [],
    };
    mockedRegisterPreferencesAPI.mockResolvedValue('OK');

    const result = await registerPreferences(data);

    expect(result.success).toBe(true);
  });
});
