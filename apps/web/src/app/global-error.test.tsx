import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GlobalError from './global-error';

// ─── Mocks ────────────────────────────────────────────────────────────
jest.mock('@repo/shared/utils', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  handleError: jest.fn(),
}));

// ─── Tests ────────────────────────────────────────────────────────────
describe('GlobalError', () => {
  const mockReset = jest.fn();
  const defaultError = Object.assign(new Error('Test error message'), {
    digest: 'test-digest-123',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error heading and description', () => {
    render(<GlobalError error={defaultError} reset={mockReset} />);

    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('A critical error occurred.')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page or go back to home.')).toBeInTheDocument();
  });

  it('renders a refresh button that calls reset on click', async () => {
    const user = userEvent.setup();
    render(<GlobalError error={defaultError} reset={mockReset} />);

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();

    await user.click(refreshButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders a link to home page', () => {
    render(<GlobalError error={defaultError} reset={mockReset} />);

    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs the error via logger.error on mount', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    render(<GlobalError error={defaultError} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Global error occurred', {
      message: 'Test error message',
      digest: 'test-digest-123',
      stack: expect.any(String),
    });
  });

  it('handles error without digest property', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    const errorWithoutDigest = new Error('No digest') as Error & { digest?: string };
    render(<GlobalError error={errorWithoutDigest} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Global error occurred', {
      message: 'No digest',
      digest: undefined,
      stack: expect.any(String),
    });
  });

  it('handles error with empty message', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    const emptyError = Object.assign(new Error(''), { digest: undefined });
    render(<GlobalError error={emptyError} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Global error occurred', {
      message: '(empty message)',
      digest: undefined,
      stack: expect.any(String),
    });
  });
});
