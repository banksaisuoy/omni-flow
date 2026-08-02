import { useState, useEffect } from 'react';

export type NegotiationPhase = 'initialized' | 'active' | 'negotiation' | 'resolved';

export interface AgentConfig {
    maxDiscount: number;
    strategy: 'aggressive' | 'balanced' | 'lenient';
    baseGreeting: string;
}

export function useAgentConfig(productId?: number) {
    const [config, setConfig] = useState<AgentConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const fetchConfig = async () => {
            setIsLoading(true);
            try {
                // Simulate fetching config from an API
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (isMounted) {
                    // Mock configuration
                    setConfig({
                        maxDiscount: 0.2, // 20% max discount
                        strategy: 'balanced',
                        baseGreeting: "Hi! I'm ready to negotiate. What's your offer?"
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch agent config'));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchConfig();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    return { config, isLoading, error };
}