'use client';

const SUBSCRIBERS_STORAGE_KEY = 'newsletter_subscribers';

export interface Subscriber {
  email: string;
  timestamp: string;
  source: string;
}

export const getSubscribers = (): Subscriber[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addSubscriber = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Also store locally for client-side access
    const existing = getSubscribers();
    if (existing.find((s) => s.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already subscribed' };
    }

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.error || 'Failed to subscribe' };
    }

    // Update local storage
    const newSubscriber: Subscriber = {
      email: email.toLowerCase(),
      timestamp: new Date().toISOString(),
      source: 'Stay Updated',
    };
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify([...existing, newSubscriber]));

    return { success: true, message: data.message || 'Successfully subscribed!' };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const getAllSubscribers = async (): Promise<Subscriber[]> => {
  try {
    // Try to get from API first
    const response = await fetch('/api/subscribe', {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.subscribers && data.subscribers.length > 0) {
        // Sync with local storage
        localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(data.subscribers));
        return data.subscribers;
      }
    }

    // Fallback to local storage
    return getSubscribers();
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    // Fallback to local storage
    return getSubscribers();
  }
};

