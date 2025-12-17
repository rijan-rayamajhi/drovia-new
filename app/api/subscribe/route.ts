import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIBERS_STORAGE_KEY = 'newsletter_subscribers';

interface Subscriber {
  email: string;
  timestamp: string;
  source: string;
}

// In-memory storage for server-side (in production, use a database)
let serverSubscribers: Subscriber[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existingSubscriber = serverSubscribers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      email: email.toLowerCase(),
      timestamp: new Date().toISOString(),
      source: 'Stay Updated',
    };

    serverSubscribers.push(newSubscriber);

    return NextResponse.json(
      { 
        message: 'Successfully subscribed!',
        subscriber: newSubscriber 
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, private',
          'Vary': 'Cookie',
        },
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json(
      { subscribers: serverSubscribers },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, private',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
