import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErrorPage from './error';

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

jest.mock('@web/lib/constants', () => ({
  ROUTES: { ROOT: '/' },
}));

jest.mock('./error.module.scss', () => ({}));

// ─── Tests ────────────────────────────────────────────────────────────
describe('ErrorPage', () => {
  const mockReset = jest.fn();
  const defaultError = Object.assign(new Error('Test error message'), {
    digest: 'test-digest-123',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error heading and description', () => {
    render(<ErrorPage error={defaultError} reset={mockReset} />);

    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('A temporary problem occurred.')).toBeInTheDocument();
    expect(screen.getByText(/The server is a little dizzy/)).toBeInTheDocument();
    expect(screen.getByText(/Please try again later/)).toBeInTheDocument();
  });

  it('renders a refresh button that calls reset directly on click', async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={defaultError} reset={mockReset} />);

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();

    await user.click(refreshButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders a home page link (not button) that navigates to ROUTES.ROOT', () => {
    render(<ErrorPage error={defaultError} reset={mockReset} />);

    const homeLink = screen.getByRole('link', { name: /go to home page/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs the error via logger.error on mount with correct fields', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    render(<ErrorPage error={defaultError} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Page error occurred', {
      message: 'Test error message',
      name: 'Error',
      digest: 'test-digest-123',
      stack: expect.any(String),
      isEmpty: false,
      url: expect.any(String),
    });
  });

  it('handles error without digest property', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    const errorWithoutDigest = new Error('No digest') as Error & { digest?: string };
    render(<ErrorPage error={errorWithoutDigest} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Page error occurred', {
      message: 'No digest',
      name: 'Error',
      digest: undefined,
      stack: expect.any(String),
      isEmpty: false,
      url: expect.any(String),
    });
  });

  it('handles error with empty message', () => {
    const { logger } = jest.requireMock('@repo/shared/utils') as {
      logger: { error: jest.Mock };
    };

    const emptyError = Object.assign(new Error(''), { digest: undefined });
    render(<ErrorPage error={emptyError} reset={mockReset} />);

    expect(logger.error).toHaveBeenCalledWith('Page error occurred', {
      message: '(empty message)',
      name: 'Error',
      digest: undefined,
      stack: expect.any(String),
      isEmpty: true,
      url: expect.any(String),
    });
  });

  it('renders the planet graphic', () => {
    render(<ErrorPage error={defaultError} reset={mockReset} />);

    const graphic = screen.getByRole('img', { name: /error occurred/i });
    expect(graphic).toBeInTheDocument();
  });
});
