import { useEffect } from 'react';
import { useStore } from '../store';
import Graph from '../components/Graph';
import Dossier from '../components/Dossier';

export default function Dashboard() {
  const { loadGraphData } = useStore();

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  return (
    <div className="w-screen h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar / Dossier */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 shrink-0">
        <Dossier />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-slate-50 min-w-0">
        <Graph />
      </div>
    </div>
  );
}
