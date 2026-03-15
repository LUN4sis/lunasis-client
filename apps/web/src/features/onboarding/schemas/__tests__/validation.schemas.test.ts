import {
  COMMERCE_PREFERENCES,
  COMMUNITY_PREFERENCES,
  FEMININE_CARE_PREFERENCES,
  GYNECOLOGY_PREFERENCES,
  HEALTH_CARE_PREFERENCES,
  HOSPITAL_PRIORITIES,
} from '../../constants/onboarding.constants';
import { preferencesSchema } from '../validation.schemas';

// ─── Test Data ────────────────────────────────────────────────────────
function validPreferences() {
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
describe('preferencesSchema', () => {
  it('accepts valid preferences data', () => {
    const result = preferencesSchema.safeParse(validPreferences());
    expect(result.success).toBe(true);
  });

  it('accepts empty arrays for optional sub-section fields', () => {
    // gynecologyInterests, hospitalPriorities, productCategories are conditionally shown
    // and may legitimately be empty. Required fields must have at least one value.
    const data = {
      healthCareInterests: [HEALTH_CARE_PREFERENCES[0].id],
      gynecologyInterests: [],
      hasVisited: true,
      hospitalPriorities: [],
      communityInterests: [COMMUNITY_PREFERENCES[0].id],
      commerceInterests: [COMMERCE_PREFERENCES[0].id],
      productCategories: [],
    };

    const result = preferencesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts all valid IDs for each category', () => {
    const data = {
      healthCareInterests: HEALTH_CARE_PREFERENCES.map((i) => i.id),
      gynecologyInterests: GYNECOLOGY_PREFERENCES.map((i) => i.id),
      hasVisited: true,
      hospitalPriorities: HOSPITAL_PRIORITIES.map((i) => i.id),
      communityInterests: COMMUNITY_PREFERENCES.map((i) => i.id),
      commerceInterests: COMMERCE_PREFERENCES.map((i) => i.id),
      productCategories: FEMININE_CARE_PREFERENCES.map((i) => i.id),
    };

    const result = preferencesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  // ─── Invalid healthCareInterests ──────────────────────────────────
  describe('healthCareInterests', () => {
    it('rejects empty array', () => {
      const data = { ...validPreferences(), healthCareInterests: [] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), healthCareInterests: ['INVALID_ID'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects when field is missing', () => {
      const { healthCareInterests: _, ...rest } = validPreferences();
      const result = preferencesSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  // ─── Invalid gynecologyInterests ──────────────────────────────────
  describe('gynecologyInterests', () => {
    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), gynecologyInterests: ['NONEXISTENT'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Invalid hospitalPriorities ───────────────────────────────────
  describe('hospitalPriorities', () => {
    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), hospitalPriorities: ['FAKE_PRIORITY'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Invalid communityInterests ───────────────────────────────────
  describe('communityInterests', () => {
    it('rejects empty array', () => {
      const data = { ...validPreferences(), communityInterests: [] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), communityInterests: ['WRONG'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Invalid commerceInterests ────────────────────────────────────
  describe('commerceInterests', () => {
    it('rejects empty array', () => {
      const data = { ...validPreferences(), commerceInterests: [] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), commerceInterests: ['BOGUS'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Invalid productCategories ────────────────────────────────────
  describe('productCategories', () => {
    it('rejects invalid IDs', () => {
      const data = { ...validPreferences(), productCategories: ['UNKNOWN'] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── hasVisited ───────────────────────────────────────────────────
  describe('hasVisited', () => {
    it('accepts true', () => {
      const data = { ...validPreferences(), hasVisited: true };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts false', () => {
      const data = { ...validPreferences(), hasVisited: false };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects non-boolean values', () => {
      const data = { ...validPreferences(), hasVisited: 'yes' };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects missing field', () => {
      const { hasVisited: _, ...rest } = validPreferences();
      const result = preferencesSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  // ─── Mixed invalid ───────────────────────────────────────────────
  describe('mixed invalid data', () => {
    it('rejects completely wrong shape', () => {
      const result = preferencesSchema.safeParse({ foo: 'bar' });
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = preferencesSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('rejects undefined', () => {
      const result = preferencesSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('rejects number arrays where string arrays are expected', () => {
      const data = { ...validPreferences(), healthCareInterests: [123, 456] };
      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
