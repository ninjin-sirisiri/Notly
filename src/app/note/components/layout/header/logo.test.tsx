import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Logo } from '@/app/note/components/layout/header/logo';
import type { ComponentProps } from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Logo Component', () => {
  it('should render the logo and link to the homepage', () => {
    render(<Logo />);

    // Check for the link
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');

    // Check for the image within the link
    const image = screen.getByRole('img', { name: /notly/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/logo.png');
    expect(image).toHaveAttribute('alt', 'Notly');
  });
});
