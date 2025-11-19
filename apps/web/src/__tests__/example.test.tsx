import { render, screen } from '@testing-library/react';

// 간단한 컴포넌트 예제
function TestComponent() {
  return <div>Hello, Jest!</div>;
}

describe('Example Test', () => {
  it('renders the test component', () => {
    render(<TestComponent />);
    const element = screen.getByText('Hello, Jest!');
    expect(element).toBeInTheDocument();
  });

  it('performs basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('checks if arrays are equal', () => {
    const arr = [1, 2, 3];
    expect(arr).toEqual([1, 2, 3]);
  });
});
