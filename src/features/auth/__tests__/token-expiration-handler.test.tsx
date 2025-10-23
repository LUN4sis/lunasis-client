import { render } from '@testing-library/react';
import { TokenExpirationHandler } from '../components/token-expiration-handler';
import { useTokenExpiration } from '../hooks/use-token-expiration';

jest.mock('../hooks/use-token-expiration');
const mockUseTokenExpiration = useTokenExpiration as jest.MockedFunction<typeof useTokenExpiration>;
// fake timer for test
jest.useFakeTimers();

describe('TokenExpirationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. should render nothing (passive component)
  it('should render nothing (passive component)', () => {
    const { container } = render(<TokenExpirationHandler />);

    // result: nothing is rendered
    expect(container.firstChild).toBeNull();
  });

  // 2. should call useTokenExpiration hook
  it('should call useTokenExpiration hook', () => {
    render(<TokenExpirationHandler />);

    // result: useTokenExpiration hook is called
    expect(mockUseTokenExpiration).toHaveBeenCalledTimes(1);
  });

  // 3. should not render any UI elements
  it('should not render any UI elements', () => {
    const { container } = render(<TokenExpirationHandler />);

    // result: no UI elements are rendered
    expect(container.innerHTML).toBe('');
  });

  // 4. should be a passive component that only runs logic
  it('should be a passive component that only runs logic', () => {
    const { rerender } = render(<TokenExpirationHandler />);

    // result: hook is called on initial render
    expect(mockUseTokenExpiration).toHaveBeenCalledTimes(1);

    // result: re-render should cause additional hook calls (React behavior)
    rerender(<TokenExpirationHandler />);
    expect(mockUseTokenExpiration).toHaveBeenCalledTimes(2);
  });
});
