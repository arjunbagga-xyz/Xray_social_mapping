import { useState } from 'react';
import browser from 'webextension-polyfill';

function App() {
  const [handle, setHandle] = useState('');
  const [status, setStatus] = useState('');

  const handleSmartExpand = async () => {
    if (!handle) return;
    setStatus(`Starting expansion for @${handle}...`);
    try {
      await browser.runtime.sendMessage({
        type: 'START_EXPANSION',
        payload: { handle }
      });
      setStatus(`Expansion started for @${handle}! Check background console.`);
    } catch (e) {
      console.error(e);
      setStatus('Error starting expansion.');
    }
  };

  return (
    <div className="w-[400px] h-[500px] bg-slate-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-pink-600 mb-2 font-mono">The Burn Book</h1>
      <p className="text-gray-500 mb-8 italic">"You can't sit with us."</p>

      <div className="w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-bold text-gray-700">Target Handle</label>
          <div className="flex space-x-2">
            <span className="flex items-center text-gray-400 font-bold">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="flex-1 p-2 border-2 border-pink-200 rounded-md focus:border-pink-500 focus:outline-none"
              placeholder="reginageorge"
            />
          </div>
        </div>

        <button
          onClick={handleSmartExpand}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all transform hover:scale-105 shadow-md"
        >
          Smart Expand (AI Crawl)
        </button>

        {status && (
          <div className="mt-4 p-3 bg-pink-100 text-pink-800 rounded text-sm text-center">
            {status}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
             <button
                onClick={() => browser.tabs.create({ url: 'dashboard.html' })}
                className="w-full bg-white text-pink-600 border-2 border-pink-500 font-bold py-2 px-4 rounded-full hover:bg-pink-50 transition-all shadow-sm"
             >
                Open Investigation Board
             </button>
        </div>
      </div>

      <div className="mt-auto text-xs text-gray-400 text-center">
        Social Graph Analysis Tool v1.0
      </div>
    </div>
  );
}

export default App;
