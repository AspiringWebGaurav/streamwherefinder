/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoaderProvider, useLoader } from '@/app/providers/LoaderProvider';
import '@testing-library/jest-dom';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock createPortal to render in place
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

// Test component that uses the loader
function TestComponent() {
  const { startTask, endTask, isLoading, taskCount } = useLoader();
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="task-count">{taskCount}</div>
      <button
        data-testid="start-task"
        onClick={() => startTask('test-task')}
      >
        Start Task
      </button>
      <button
        data-testid="end-task"
        onClick={() => endTask('test-task')}
      >
        End Task
      </button>
    </div>
  );
}

describe('LoaderProvider', () => {
  beforeEach(() => {
    // Create the portal target
    const portalRoot = document.createElement('div');
    portalRoot.id = '__global_loader_root';
    document.body.appendChild(portalRoot);
    
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up portal target
    const portalRoot = document.getElementById('__global_loader_root');
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
    
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render children correctly', () => {
    render(
      <LoaderProvider>
        <div data-testid="child">Test Child</div>
      </LoaderProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide initial loading state', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );

    expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
  });

  it('should start and end tasks correctly', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );

    // Start a task
    await user.click(screen.getByTestId('start-task'));
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');

    // End the task
    await user.click(screen.getByTestId('end-task'));
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
  });

  it('should handle multiple concurrent tasks', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    function MultiTaskComponent() {
      const { startTask, endTask, taskCount } = useLoader();
      
      return (
        <div>
          <div data-testid="task-count">{taskCount}</div>
          <button onClick={() => startTask('task-1')}>Start Task 1</button>
          <button onClick={() => startTask('task-2')}>Start Task 2</button>
          <button onClick={() => endTask('task-1')}>End Task 1</button>
          <button onClick={() => endTask('task-2')}>End Task 2</button>
        </div>
      );
    }

    render(
      <LoaderProvider>
        <MultiTaskComponent />
      </LoaderProvider>
    );

    // Start multiple tasks
    await user.click(screen.getByText('Start Task 1'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');

    await user.click(screen.getByText('Start Task 2'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('2');

    // End one task
    await user.click(screen.getByText('End Task 1'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');

    // End remaining task
    await user.click(screen.getByText('End Task 2'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
  });

  it('should show timeout message after specified duration', async () => {
    const timeoutDuration = 5000; // 5 seconds for testing
    
    render(
      <LoaderProvider timeoutDuration={timeoutDuration}>
        <TestComponent />
      </LoaderProvider>
    );

    // Start a task
    await userEvent.click(screen.getByTestId('start-task'));
    
    // Initially no timeout message
    expect(screen.queryByText('Still working...')).not.toBeInTheDocument();

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(timeoutDuration);
    });

    // Timeout message should appear
    await waitFor(() => {
      expect(screen.getByText('Still working...')).toBeInTheDocument();
    });
  });

  it('should respect debounce delay', () => {
    const debounceDelay = 200;
    
    render(
      <LoaderProvider debounceDelay={debounceDelay}>
        <TestComponent />
      </LoaderProvider>
    );

    // Start a task
    act(() => {
      screen.getByTestId('start-task').click();
    });

    // Global loader should not be visible immediately (due to debounce)
    expect(screen.queryByLabelText('Loading StreamWhereFinder')).not.toBeInTheDocument();

    // Advance time by debounce delay
    act(() => {
      jest.advanceTimersByTime(debounceDelay);
    });

    // Now the loader should be visible
    expect(screen.getByLabelText('Loading StreamWhereFinder')).toBeInTheDocument();
  });

  it('should handle task cleanup on unmount', () => {
    const { unmount } = render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );

    // Start a task
    act(() => {
      screen.getByTestId('start-task').click();
    });

    // Unmount the component
    unmount();

    // Should not throw errors
    expect(true).toBe(true);
  });
});

describe('useLoader hook', () => {
  it('should throw error when used outside LoaderProvider', () => {
    // Mock console.error to avoid test noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    function TestComponentOutsideProvider() {
      useLoader(); // This should throw
      return <div>Test</div>;
    }

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useLoader must be used within a LoaderProvider');

    consoleSpy.mockRestore();
  });
});