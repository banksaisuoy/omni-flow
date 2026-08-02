import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NegotiationBot from '../components/ai/NegotiationBot';
import { negotiatePrice } from '../app/actions/negotiate';
import { useAgentConfig } from '../hooks/useAgentConfig';

// Mock dependencies
jest.mock('../app/actions/negotiate', () => ({
    negotiatePrice: jest.fn(),
}));

jest.mock('../hooks/useAgentConfig', () => ({
    useAgentConfig: jest.fn(),
}));

describe('NegotiationBot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock for useAgentConfig
        (useAgentConfig as jest.Mock).mockReturnValue({
            config: {
                baseGreeting: 'Hello! I am ready to negotiate.',
                maxDiscount: 0.2,
                strategy: 'balanced'
            },
            isLoading: false,
            error: null
        });
    });

    test('initializes and transitions to active phase when config is loaded', () => {
        render(<NegotiationBot productPrice={100} />);
        
        // Open the bot
        const floatingButton = screen.getByRole('button');
        fireEvent.click(floatingButton);
        
        // Should show the base greeting
        expect(screen.getByText('Hello! I am ready to negotiate.')).toBeInTheDocument();
        
        // Should be in active state (indicated by the Status text)
        expect(screen.getByText('Status: active')).toBeInTheDocument();
    });

    test('transitions to negotiation phase while waiting for response', async () => {
        // Mock a delayed response
        (negotiatePrice as jest.Mock).mockImplementation(() => {
            return new Promise(resolve => {
                setTimeout(() => resolve({ text: 'Let me think...' }), 100);
            });
        });

        render(<NegotiationBot productPrice={100} />);
        
        // Open the bot
        fireEvent.click(screen.getByRole('button'));
        
        // Type a message and send
        const input = screen.getByPlaceholderText('Ask for a discount...');
        fireEvent.change(input, { target: { value: 'How about $80?' } });
        
        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('svg')?.classList.contains('lucide-send'));
        if(sendButton) {
            fireEvent.click(sendButton);
        }

        // Should be in negotiation phase immediately after sending
        expect(screen.getByText('Status: negotiation')).toBeInTheDocument();
        
        // Wait for response to resolve
        await waitFor(() => {
            expect(screen.getByText('Let me think...')).toBeInTheDocument();
        });
        
        // Should go back to active phase after response
        expect(screen.getByText('Status: active')).toBeInTheDocument();
    });

    test('transitions to resolved phase on successful deal', async () => {
        (negotiatePrice as jest.Mock).mockResolvedValue({ text: 'DEAL! Here is your discount.' });

        render(<NegotiationBot productPrice={100} />);
        
        // Open the bot
        fireEvent.click(screen.getByRole('button'));
        
        // Type a message and send
        const input = screen.getByPlaceholderText('Ask for a discount...');
        fireEvent.change(input, { target: { value: 'How about $90?' } });
        
        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('svg')?.classList.contains('lucide-send'));
        if(sendButton) {
            fireEvent.click(sendButton);
        }

        // Wait for response
        await waitFor(() => {
            expect(screen.getByText('DEAL! Here is your discount.')).toBeInTheDocument();
        });
        
        // Should be in resolved phase
        expect(screen.getByText('Status: resolved')).toBeInTheDocument();
        
        // Input should be disabled when resolved
        const afterInput = screen.getByPlaceholderText('Ask for a discount...');
        expect(afterInput).toBeDisabled();
    });

    test('handles empty messages', () => {
        render(<NegotiationBot productPrice={100} />);
        
        // Open the bot
        fireEvent.click(screen.getByRole('button'));
        
        // Try to send empty message
        const input = screen.getByPlaceholderText('Ask for a discount...');
        fireEvent.change(input, { target: { value: '   ' } });
        
        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('svg')?.classList.contains('lucide-send'));
        expect(sendButton).toBeDisabled();
    });
});