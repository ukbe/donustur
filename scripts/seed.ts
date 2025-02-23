import {Amplify} from 'aws-amplify';
import {generateClient} from 'aws-amplify/api';
import type {Schema} from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const testLocations = [
  'Kadıköy Geri Dönüşüm',
  'Üsküdar Geri Dönüşüm',
  'Beşiktaş Geri Dönüşüm',
  'Maltepe Geri Dönüşüm',
];

async function seedData() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Please provide a userId as argument');
    process.exit(1);
  }

  const now = new Date();
  const scans = Array.from({length: 10}, (_, i) => ({
    userId,
    timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
    credits: 50,
    binLocation: testLocations[Math.floor(Math.random() * testLocations.length)],
    tokenId: `test-token-${i}`
  }));

  for (const scan of scans) {
    await client.models.Scan.create(scan);
    console.log(`Created scan at ${scan.binLocation}`);
  }

  console.log('Seeding completed!');
}

seedData().catch(console.error); 