import { renderHook, act } from '@testing-library/react';
import { useOnboardingInterests } from '../hooks/use-onboarding-interests';
import { useOnboardingStore } from '../stores/use-onboarding-store';
import { Insurance, ProductCategory } from '../constants/onboarding.constants';

jest.mock('../stores/use-onboarding-store');

describe('useOnboardingInterests', () => {
  const mockStore = {
    chatbotService: false,
    privateChat: false,
    myHealthAnalysis: false,
    hospitalSearch: false,
    insuranceOptions: [] as Insurance[],
    communityOptions: [] as string[],
    productSearch: false,
    priceComparison: false,
    productCategories: [] as ProductCategory[],
    setChatbotService: jest.fn(),
    setPrivateChat: jest.fn(),
    toggleMyHealthAnalysis: jest.fn(),
    setHospitalSearch: jest.fn(),
    setInsuranceOptions: jest.fn(),
    setCommunityOptions: jest.fn(),
    toggleProductSearch: jest.fn(),
    setPriceComparison: jest.fn(),
    setProductCategories: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('should return the initial state', () => {
    const { result } = renderHook(() => useOnboardingInterests());

    expect(result.current.chatbotService).toBe(false);
    expect(result.current.privateChat).toBe(false);
    expect(result.current.insuranceOptions).toEqual([]);
  });

  it('should toggle the chatbot service', () => {
    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleChatbotService();
    });

    expect(mockStore.setChatbotService).toHaveBeenCalledWith(true);
  });

  it('should add an insurance option', () => {
    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleInsuranceToggle(Insurance.KAISER);
    });

    expect(mockStore.setInsuranceOptions).toHaveBeenCalledWith([Insurance.KAISER]);
  });

  it('should remove an insurance option', () => {
    mockStore.insuranceOptions = [Insurance.KAISER, Insurance.AETNA];

    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleInsuranceToggle(Insurance.KAISER);
    });

    expect(mockStore.setInsuranceOptions).toHaveBeenCalledWith([Insurance.AETNA]);
  });

  it('should toggle a community option', () => {
    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleCommunityToggle('COMMUNITY');
    });

    expect(mockStore.setCommunityOptions).toHaveBeenCalledWith(['COMMUNITY']);
  });

  it('should add a product category', () => {
    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleProductCategoryToggle(ProductCategory.TAMPON);
    });

    expect(mockStore.setProductCategories).toHaveBeenCalledWith([ProductCategory.TAMPON]);
  });

  it('should remove a product category', () => {
    mockStore.productCategories = [ProductCategory.TAMPON, ProductCategory.SANITARY_PAD];

    const { result } = renderHook(() => useOnboardingInterests());

    act(() => {
      result.current.handleProductCategoryToggle(ProductCategory.TAMPON);
    });

    expect(mockStore.setProductCategories).toHaveBeenCalledWith([ProductCategory.SANITARY_PAD]);
  });
});
