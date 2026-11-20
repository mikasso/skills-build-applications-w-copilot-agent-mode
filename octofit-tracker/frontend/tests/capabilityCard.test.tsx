import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CapabilityCard } from '../src/components/CapabilityCard.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CapabilityCard', () => {
  it('announces an error when the API response is missing its collection', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200 })));

    render(<CapabilityCard<{ name: string }>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      resource="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => team.name}
    />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/unable to load teams/i));
  });
});
