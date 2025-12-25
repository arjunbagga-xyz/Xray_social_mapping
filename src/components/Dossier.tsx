import browser from '../lib/browser';
import { useStore } from '../store';

export default function Dossier() {
  const { selectedNodeId, selectedEdgeId, profiles, relationships } = useStore();

  const selectedProfile = selectedNodeId
    ? profiles.find((p) => p.handle === selectedNodeId)
    : null;

  const selectedRelationship = selectedEdgeId
    ? relationships.find((r) => `${r.source}-${r.target}` === selectedEdgeId)
    : null;

  const handleCrawlConnections = async () => {
    if (!selectedProfile) return;
    try {
      await browser.runtime.sendMessage({
        type: 'START_EXPANSION',
        payload: { handle: selectedProfile.handle }
      });
      alert(`Expansion started for @${selectedProfile.handle}`);
    } catch (error) {
        console.error("Failed to start expansion", error);
    }
  };

  const handleAnalyzeDeeper = async () => {
      if (!selectedProfile) return;
      // In a real implementation, this would trigger a specific AI analysis task
      console.log("Analyzing deeper for", selectedProfile.handle);
      alert(`Deep analysis queued for @${selectedProfile.handle}`);
  };

  if (selectedProfile) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-pink-100 bg-pink-50">
          <h2 className="text-xl font-extrabold text-pink-600 font-mono uppercase tracking-widest">
            Burn Book Entry
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col items-center">
                <div className="relative">
                     <img
                        src={selectedProfile.avatarUrl || `https://ui-avatars.com/api/?name=${selectedProfile.handle}&background=random`}
                        alt={selectedProfile.name}
                        className="w-32 h-32 rounded-full border-4 border-pink-500 shadow-xl object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                        Rank #{Math.floor(Math.random() * 10) + 1}
                    </div>
                </div>

                <h2 className="mt-4 text-2xl font-black text-gray-900">@{selectedProfile.handle}</h2>
                <p className="text-gray-500 font-medium">{selectedProfile.name}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
                <p className="text-gray-600 italic font-serif leading-relaxed">
                    "{selectedProfile.bio}"
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-pink-50 p-3 rounded text-center">
                    <span className="block text-xl font-bold text-pink-700">{selectedProfile.followersCount.toLocaleString()}</span>
                    <span className="text-xs text-pink-400 uppercase font-bold tracking-wide">Followers</span>
                </div>
                <div className="bg-pink-50 p-3 rounded text-center">
                    <span className="block text-xl font-bold text-pink-700">{selectedProfile.followingCount.toLocaleString()}</span>
                    <span className="text-xs text-pink-400 uppercase font-bold tracking-wide">Following</span>
                </div>
            </div>

            {selectedProfile.tags && selectedProfile.tags.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vibe Check</h3>
                    <div className="flex flex-wrap gap-2">
                    {selectedProfile.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold border border-purple-200">
                            {tag}
                        </span>
                    ))}
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                    onClick={handleCrawlConnections}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow transition-all flex items-center justify-center space-x-2"
                >
                    <span>🕷️</span>
                    <span>Crawl Connections</span>
                </button>
                <button
                    onClick={handleAnalyzeDeeper}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                    <span>🔮</span>
                    <span>Analyze Deeper</span>
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (selectedRelationship) {
      return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-pink-100 bg-pink-50">
                <h2 className="text-xl font-extrabold text-pink-600 font-mono uppercase tracking-widest">
                    Drama Analysis
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-center">
                         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 mx-auto mb-1">
                             {selectedRelationship.source.substring(0, 2).toUpperCase()}
                         </div>
                         <span className="text-xs font-bold text-gray-700">@{selectedRelationship.source}</span>
                    </div>
                    <div className="flex-1 px-4 text-center">
                         <div className="h-0.5 bg-gray-300 w-full relative">
                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-2 text-xs text-gray-400">
                                 {selectedRelationship.type}
                             </div>
                         </div>
                    </div>
                    <div className="text-center">
                         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 mx-auto mb-1">
                             {selectedRelationship.target.substring(0, 2).toUpperCase()}
                         </div>
                         <span className="text-xs font-bold text-gray-700">@{selectedRelationship.target}</span>
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${
                            selectedRelationship.sentiment === 'hostile' ? 'bg-red-100 text-red-700 border-red-200' :
                            selectedRelationship.sentiment === 'friendly' ? 'bg-green-100 text-green-700 border-green-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                            {selectedRelationship.sentiment.charAt(0).toUpperCase() + selectedRelationship.sentiment.slice(1)}
                        </div>
                     </div>

                     <div>
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interactions</h3>
                         <span className="text-3xl font-black text-gray-800">{selectedRelationship.interactions}</span>
                         <span className="text-gray-400 ml-2">events recorded</span>
                     </div>

                     {selectedRelationship.context && (
                         <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                             <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">The Tea ☕</h3>
                             <p className="text-sm text-yellow-800 leading-relaxed">
                                 {selectedRelationship.context}
                             </p>
                         </div>
                     )}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">👀</span>
      </div>
      <h3 className="text-lg font-bold text-gray-600">Nothing Selected</h3>
      <p className="text-sm mt-2">Click on a profile (node) or connection (edge) to view the dossier.</p>
    </div>
  );
}
