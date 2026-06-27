import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import DashboardHome from '../DashboardHome';

describe('DashboardHome', () => {
  it('renders role-specific dashboard stats from the provided stats object', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(
        <DashboardHome
          stats={{
            totalMarks: 78,
            attendanceRecords: 20,
            homeworkAssignments: 5,
          }}
        />
      );
    });

    expect(container.textContent).toContain('Total Marks');
    expect(container.textContent).toContain('78');
    expect(container.textContent).toContain('Attendance Records');
    expect(container.textContent).toContain('20');

    container.remove();
  });
});
