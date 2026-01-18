import { dbPromise } from './db';
import { Profile, Relationship } from '../types/db';

export async function seedDemoData() {
  const db = await dbPromise;

  const profiles: Profile[] = [
    {
      handle: 'ZuiLoong',
      name: 'Zui Loong',
      bio: 'Just trying to make it in this digital high school. 💅',
      avatarUrl: 'https://ui-avatars.com/api/?name=Zui+Loong&background=ec4899&color=fff',
      followersCount: 1200,
      followingCount: 450,
      addedAt: Date.now(),
      tags: ['Queen Bee', 'Vibe Curator']
    },
    {
      handle: 'elonmusk',
      name: 'Elon Musk',
      bio: 'Technoking of Tesla. I put the "mean" in meme.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Elon+Musk&background=000&color=fff',
      followersCount: 150000000,
      followingCount: 100,
      addedAt: Date.now(),
      tags: ['Chaos Agent', 'Reply Guy']
    },
    {
      handle: 'templemaster',
      name: 'Temple Master',
      bio: 'Zen mode enabled. Do not disturb unless you have tea. 🍵',
      avatarUrl: 'https://ui-avatars.com/api/?name=Temple+Master&background=22c55e&color=fff',
      followersCount: 5000,
      followingCount: 200,
      addedAt: Date.now(),
      tags: ['Floater', 'Unbothered']
    }
  ];

  const relationships: Relationship[] = [
    {
      source: 'ZuiLoong',
      target: 'templemaster',
      type: 'mutual',
      interactions: 42,
      sentiment: 'friendly',
      context: 'Constantly replying with "SLAY" and exchanging bubble tea recipes.',
      updatedAt: Date.now()
    },
    {
      source: 'elonmusk',
      target: 'templemaster',
      type: 'follows',
      interactions: 150,
      sentiment: 'hostile',
      context: 'Elon keeps quote-tweeting Temple with terrible jokes. Temple blocked him twice.',
      updatedAt: Date.now()
    },
    {
      source: 'ZuiLoong',
      target: 'elonmusk',
      type: 'followed_by',
      interactions: 5,
      sentiment: 'transactional',
      context: 'Zui tried to sell Elon an NFT. He left it on read.',
      updatedAt: Date.now()
    }
  ];

  const tx = db.transaction(['profiles', 'relationships'], 'readwrite');

  // Clear existing
  await tx.objectStore('profiles').clear();
  await tx.objectStore('relationships').clear();

  // Add new
  for (const p of profiles) {
    await tx.objectStore('profiles').add(p);
  }
  for (const r of relationships) {
    await tx.objectStore('relationships').add(r);
  }

  await tx.done;
  console.log('Demo data seeded!');
}
