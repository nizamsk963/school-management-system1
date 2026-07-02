import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AccountantReports from '../AccountantReports';
import { feeService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  feeService: {
    getAll: jest.fn(),
  },
}));

describe('AccountantReports', () => {
  beforeEach(() => {
    feeService.getAll.mockReset();
  });

  it('renders an auth error state instead of crashing when the session is unauthorized', async () => {
    const unauthorizedError = {
      response: { status: 401 },
      message: 'Request failed with status code 401',
    };
    feeService.getAll.mockRejectedValueOnce(unauthorizedError);

    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container).render(<AccountantReports />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Your session has expired. Please log in again.');

    container.remove();
  });
});
