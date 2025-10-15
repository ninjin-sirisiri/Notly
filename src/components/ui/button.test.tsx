import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle onClick events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle onClick events when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply the correct variant class', () => {
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByRole('button', { name: /destructive/i });
    // Check for a class specific to the destructive variant
    expect(button).toHaveClass('bg-destructive');
  });

  it('should apply the correct size class', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button', { name: /small/i });
    // Check for a class specific to the sm size
    expect(button).toHaveClass('h-8');
  });

  it('should render as a different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#">Link</a>
      </Button>
    );

    // It should render an anchor tag instead of a button
    const linkElement = screen.getByRole('link', { name: /link/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');

    // It should not render a button element
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
