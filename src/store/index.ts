import { create } from 'zustand';
import { dbPromise } from '../lib/db';
import { Profile, Relationship } from '../types/db';

interface GraphState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  profiles: Profile[];
  relationships: Relationship[];
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  loadGraphData: () => Promise<void>;
}

export const useStore = create<GraphState>((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  profiles: [],
  relationships: [],
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  loadGraphData: async () => {
    try {
      const db = await dbPromise;
      const profiles = await db.getAll('profiles');
      const relationships = await db.getAll('relationships');
      set({ profiles, relationships });
    } catch (error) {
      console.error('Failed to load graph data:', error);
    }
  },
}));
