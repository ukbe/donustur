import {generateClient} from 'aws-amplify/api';
import type {Schema} from '../../amplify/data/resource';

export const client = generateClient<Schema>();

export type Scan = {
  id: string;
  userId: string;
  timestamp: string;
  credits: number;
  binLocation: string;
};

export async function getUserScans(userId: string): Promise<Scan[]> {
  const response = await client.models.Scan.list({
    filter: {
      userId: {eq: userId}
    }
  });
  return response.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getUserStats(userId: string) {
  const scans = await getUserScans(userId);
  return {
    totalCredits: scans.reduce((sum, scan) => sum + scan.credits, 0),
    totalScans: scans.length,
    usedCredits: 0, // Will implement with marketplace
  };
} 