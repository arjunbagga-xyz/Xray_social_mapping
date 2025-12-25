import { useEffect } from 'react';
import { useStore } from '../store';
import Graph from '../components/Graph';

export default function Dashboard() {
  const { loadGraphData, selectedNodeId, profiles } = useStore();

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const selectedProfile = profiles.find((p) => p.handle === selectedNodeId);

  return (
    <div className="w-screen h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-pink-100 bg-pink-50">
          <h1 className="text-2xl font-extrabold text-pink-600 font-mono">The Burn Book</h1>
          <p className="text-sm text-gray-500 italic">Investigation Board</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedProfile ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <img
                  src={selectedProfile.avatarUrl}
                  alt={selectedProfile.name}
                  className="w-24 h-24 rounded-full border-4 border-pink-400 shadow-md object-cover"
                />
                <h2 className="mt-3 text-xl font-bold text-gray-800">@{selectedProfile.handle}</h2>
                <p className="text-sm text-gray-500">{selectedProfile.name}</p>
              </div>

              <div className="bg-pink-50 p-3 rounded-md border border-pink-100">
                <p className="text-sm italic text-gray-700">"{selectedProfile.bio}"</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Followers</span>
                  <span className="font-bold">{selectedProfile.followersCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Following</span>
                  <span className="font-bold">{selectedProfile.followingCount}</span>
                </div>
              </div>

              {selectedProfile.tags && selectedProfile.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-2">
                    {selectedProfile.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">
                            {tag}
                        </span>
                    ))}
                 </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
              <p>Select a node to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-slate-50">
        <Graph />
      </div>
    </div>
  );
}
