import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './main';

describe('Progressly frontend', () => {
  it('renders the authentication shell', () => {
    render(<App />);
    expect(screen.getAllByText('Progressly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Log in').length).toBeGreaterThan(0);
  });
});
