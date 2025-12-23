import { openDB, DBSchema } from 'idb';
import { Profile, Relationship, Interaction } from '../types/db';

interface MeanGirlsDB extends DBSchema {
  profiles: {
    key: string; // handle
    value: Profile;
  };
  relationships: {
    key: string; // "source:target"
    value: Relationship;
    indexes: { 'by-source': string };
  };
  interactions: {
    key: string;
    value: Interaction;
    indexes: { 'by-pair': string }; // "handle1:handle2" (sorted)
  };
}

const DB_NAME = 'mean-girls-db';
const DB_VERSION = 1;

export async function initDB() {
  return openDB<MeanGirlsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'handle' });
      }
      if (!db.objectStoreNames.contains('relationships')) {
        const store = db.createObjectStore('relationships', { keyPath: ['source', 'target'] });
        store.createIndex('by-source', 'source');
      }
      if (!db.objectStoreNames.contains('interactions')) {
        const store = db.createObjectStore('interactions', { keyPath: 'id' });
        store.createIndex('by-pair', ['from', 'to']); // We might need a computed index for pairs
      }
    },
  });
}

export const dbPromise = initDB();
