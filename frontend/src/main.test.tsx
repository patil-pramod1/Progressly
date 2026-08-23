import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './main';

describe('Progressly starter', () => {
  it('renders the Phase 1 landing shell', () => {
    render(<App />);
    expect(screen.getByText('Progressly')).toBeTruthy();
    expect(screen.getByText('Phase 1 foundation ready')).toBeTruthy();
  });
});

