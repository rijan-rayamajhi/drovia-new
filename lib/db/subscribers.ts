import connectToDatabase from './mongodb';
import Subscriber from '@/models/Subscriber';
import { Subscriber as SubscriberType } from '@/lib/subscribers';

export async function createSubscriber(email: string, source: string = 'Stay Updated'): Promise<SubscriberType> {
  await connectToDatabase();
  
  const subscriber = await Subscriber.create({
    email: email.toLowerCase(),
    source,
    timestamp: new Date(),
    active: true
  });
  
  return {
    email: subscriber.email,
    timestamp: subscriber.timestamp.toISOString(),
    source: subscriber.source
  };
}

export async function getSubscriberByEmail(email: string): Promise<SubscriberType | null> {
  await connectToDatabase();
  const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
  
  if (!subscriber) return null;
  
  return {
    email: subscriber.email,
    timestamp: subscriber.timestamp.toISOString(),
    source: subscriber.source
  };
}

export async function getAllSubscribers(): Promise<SubscriberType[]> {
  await connectToDatabase();
  const subscribers = await Subscriber.find({ active: true }).sort({ timestamp: -1 });
  
  return subscribers.map(sub => ({
    email: sub.email,
    timestamp: sub.timestamp.toISOString(),
    source: sub.source
  }));
}

export async function unsubscribe(email: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Subscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { active: false }
  );
  
  return !!result;
}

