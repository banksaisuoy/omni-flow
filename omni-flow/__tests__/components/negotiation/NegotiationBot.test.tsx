import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import NegotiationBot from '../../../app/components/negotiation/NegotiationBot';

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `uuid-${Math.random()}`,
  },
});

// Mock fetch
const originalFetch = global.fetch;

describe('NegotiationBot Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    global.fetch = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<NegotiationBot />);

    expect(screen.getByRole('region', { name: /Negotiation Interface/i })).toBeInTheDocument();
    expect(screen.getByText('Negotiation AI')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /Current state: idle/i })).toHaveTextContent('IDLE');
    expect(screen.getByText('Start negotiating by sending a message.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Message input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
    
    // Accessibility checks
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });

  it('handles input changes', () => {
    render(<NegotiationBot />);
    const input = screen.getByRole('textbox', { name: /Message input/i });
    
    fireEvent.change(input, { target: { value: '1000' } });
    expect(input).toHaveValue('1000');
  });

  it('submits a message and displays it in the chat', async () => {
    // Mock the streaming response
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => {
          let readCount = 0;
          return {
            read: jest.fn().mockImplementation(() => {
              readCount++;
              if (readCount === 1) {
                return Promise.resolve({
                  value: new TextEncoder().encode('I accept your offer.'),
                  done: false
                });
              }
              return Promise.resolve({ done: true });
            })
          };
        }
      }
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<NegotiationBot />);
    
    const input = screen.getByRole('textbox', { name: /Message input/i });
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    await act(async () => {
        fireEvent.change(input, { target: { value: 'I offer $1000' } });
        fireEvent.click(sendButton);
    });

    // Verify user message is displayed
    expect(screen.getByText('I offer $1000')).toBeInTheDocument();
    expect(input).toHaveValue(''); // Input should be cleared

    // Verify loading spinner shows up while streaming
    // expect(screen.getByLabelText('AI is typing...')).toBeInTheDocument();
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/negotiate', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: 'default-conversation',
        message: 'I offer $1000'
      }),
      signal: expect.any(AbortSignal)
    }));

    // Verify AI response after stream resolves
    await waitFor(() => {
      expect(screen.getByText('I accept your offer.')).toBeInTheDocument();
    });

    // Verify state changed to ACCEPTED based on heuristic in code
    expect(screen.getByRole('status')).toHaveTextContent('ACCEPTED');
  });

  it('displays network error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network disconnected'));

    render(<NegotiationBot />);
    
    const input = screen.getByRole('textbox', { name: /Message input/i });
    
    await act(async () => {
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' }); // Test Enter key submission
    });

    await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Network disconnected/i)).toBeInTheDocument();
    });
  });
  
  it('displays error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<NegotiationBot />);
    
    const input = screen.getByRole('textbox', { name: /Message input/i });
    
    await act(async () => {
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(screen.getByRole('button', { name: /Send message/i }));
    });

    await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/HTTP error! status: 500/i)).toBeInTheDocument();
    });
  });

  it('handles Ctrl+Enter keyboard shortcut for submission', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true })
        })
      }
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<NegotiationBot />);
    
    const input = screen.getByRole('textbox', { name: /Message input/i });
    
    await act(async () => {
        fireEvent.change(input, { target: { value: 'Quick send' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', ctrlKey: true });
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(screen.getByText('Quick send')).toBeInTheDocument();
  });

  it('updates visual indicator states correctly based on content heuristic', async () => {
    const simulateAIResponse = async (text: string) => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            body: {
                getReader: () => {
                    let done = false;
                    return {
                        read: jest.fn().mockImplementation(() => {
                            if (!done) {
                                done = true;
                                return Promise.resolve({
                                    value: new TextEncoder().encode(text),
                                    done: false
                                });
                            }
                            return Promise.resolve({ done: true });
                        })
                    };
                }
            }
        });
        
        const input = screen.getByRole('textbox');
        await act(async () => {
            fireEvent.change(input, { target: { value: 'message' } });
            fireEvent.click(screen.getByRole('button', { name: /Send/i }));
        });
    };

    render(<NegotiationBot />);
    
    // Initial state
    expect(screen.getByRole('status')).toHaveTextContent('IDLE');

    // Test rejection state
    await simulateAIResponse("I reject that.");
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('REJECTED'));

    // Test counter offer state
    await simulateAIResponse("I counter with 500.");
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('COUNTER OFFER'));
    
    // Test accept state
    await simulateAIResponse("I accept.");
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('ACCEPTED'));
  });
});