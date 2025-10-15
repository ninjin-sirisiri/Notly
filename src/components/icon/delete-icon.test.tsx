import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteIcon } from '@/components/icon/delete-icon';

describe('DeleteIcon Component', () => {
  it('should render the SVG icon', () => {
    render(<DeleteIcon data-testid="delete-icon" />);
    const icon = screen.getByTestId('delete-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.tagName).toBe('svg');
  });

  it('should handle onClick events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<DeleteIcon onClick={handleClick} data-testid="delete-icon" />);

    const icon = screen.getByTestId('delete-icon');
    await user.click(icon);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply className prop', () => {
    const testClass = 'my-custom-class';
    render(<DeleteIcon className={testClass} data-testid="delete-icon" />);
    const icon = screen.getByTestId('delete-icon');
    expect(icon).toHaveClass(testClass);
  });

  it('should pass other SVG props', () => {
    render(<DeleteIcon width="2em" height="2em" data-testid="delete-icon" />);
    const icon = screen.getByTestId('delete-icon');
    expect(icon).toHaveAttribute('width', '2em');
    expect(icon).toHaveAttribute('height', '2em');
  });
});
