import { useEffect, useState } from 'react';
import { useStore } from '../store';
import Graph from '../components/Graph';
import Dossier from '../components/Dossier';
import cytoscape from 'cytoscape';
import { seedDemoData } from '../lib/demo-data';

export default function Dashboard() {
  const { loadGraphData } = useStore();
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const handleExport = () => {
    if (cyInstance) {
        const png = cyInstance.png({ bg: 'white', full: true, output: 'blob' });
        const url = URL.createObjectURL(png);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'investigation-board.png';
        a.click();
    }
  };

  const handleLoadDemo = async () => {
      if (confirm('This will clear current data and load demo content. Proceed?')) {
          await seedDemoData();
          await loadGraphData();
          // Force layout refresh if needed
          if (cyInstance) {
              cyInstance.layout({ name: 'cose', animate: true }).run();
          }
      }
  }

  return (
    <div className="w-screen h-screen flex bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar / Dossier */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-pink-50">
             <div className="flex items-center space-x-2">
                 <span className="text-xl">💋</span>
                 <h1 className="text-lg font-bold text-pink-600 font-burn-book tracking-tight">The Burn Book</h1>
             </div>
             <a
                href="https://buymeacoffee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white text-pink-500 border border-pink-200 px-3 py-1 rounded-full font-bold hover:bg-pink-50 transition-colors"
             >
                Donate
             </a>
        </div>
        <Dossier />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-slate-50 min-w-0 flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-4 right-4 z-20 flex space-x-3">
            <button
                onClick={handleLoadDemo}
                className="bg-white/90 backdrop-blur text-pink-600 border border-pink-200 shadow-sm px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all flex items-center space-x-2"
            >
                <span>🚀</span>
                <span>Demo</span>
            </button>
            <button
                onClick={handleExport}
                className="bg-white/90 backdrop-blur text-gray-700 border border-gray-200 shadow-sm px-4 py-2 rounded-lg font-bold hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all flex items-center space-x-2"
            >
                <span>📸</span>
                <span>Export Graph</span>
            </button>
        </div>

        <Graph setCyInstance={setCyInstance} />
      </div>
    </div>
  );
}
