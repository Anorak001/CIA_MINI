import { useState, useEffect } from 'react';

export const useExchangeRate = (initialRate = 82) => {
  const [exchangeRate, setExchangeRate] = useState(initialRate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you'd fetch this from an API
      // For now, we'll use a simulated delay and a slightly randomized rate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a rate between 80 and 84
      const randomRate = 82 + (Math.random() * 4 - 2);
      setExchangeRate(parseFloat(randomRate.toFixed(2)));
    } catch (err) {
      setError('Failed to fetch exchange rate. Using default rate.');
      console.error('Error fetching exchange rate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  return {
    exchangeRate,
    isLoading,
    error,
    fetchExchangeRate
  };
};
