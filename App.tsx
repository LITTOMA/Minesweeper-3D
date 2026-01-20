
import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import GameScene from './components/GameScene';
import { Difficulty, GameStatus, DIFFICULTIES } from './types';
import { getTacticalAdvice } from './services/geminiService';
import { Trophy, Skull, Zap, Info, RefreshCw, Cpu, Clock, Target, Layers, Scissors } from 'lucide-react';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const { board, revealCell, flagCell, initGame } = useGameLogic(difficulty);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [timer, setTimer] = useState(0);

  // Slicer state
  const currentSize = DIFFICULTIES[difficulty].size;
  const [xRange, setXRange] = useState<[number, number]>([0, currentSize - 1]);
  const [yRange, setYRange] = useState<[number, number]>([0, currentSize - 1]);
  const [zRange, setZRange] = useState<[number, number]>([0, currentSize - 1]);

  // Reset slicers when difficulty changes
  useEffect(() => {
    const size = DIFFICULTIES[difficulty].size;
    setXRange([0, size - 1]);
    setYRange([0, size - 1]);
    setZRange([0, size - 1]);
  }, [difficulty]);

  useEffect(() => {
    let interval: any;
    if (board?.status === 'PLAYING') {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - (board.startTime || 0)) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [board?.status, board?.startTime]);

  const handleConsultAI = async () => {
    if (!board || isConsulting) return;
    setIsConsulting(true);
    setAdvice("Analyzing spatial anomalies...");
    const text = await getTacticalAdvice(board);
    setAdvice(text);
    setIsConsulting(false);
  };

  const getStatusText = () => {
    if (!board) return "INITIALIZING";
    if (board.status === 'WON') return "CUBE NEUTRALIZED";
    if (board.status === 'LOST') return "GRID COLLAPSE";
    return "OPERATIONAL";
  };

  const flaggedCount = board ? board.cells.flat(2).filter(c => c.isFlagged).length : 0;

  const SlicerControl = ({ label, range, setRange, max }: { label: string, range: [number, number], setRange: (r: [number, number]) => void, max: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span>{range[0]} - {range[1]}</span>
      </div>
      <div className="flex gap-2 items-center">
        <input 
          type="range" min="0" max={max} value={range[0]} 
          onChange={(e) => setRange([Math.min(parseInt(e.target.value), range[1]), range[1]])}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <input 
          type="range" min="0" max={max} value={range[1]} 
          onChange={(e) => setRange([range[0], Math.max(parseInt(e.target.value), range[0])])}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col md:flex-row font-sans">
      {/* HUD Header (Mobile) / Left Panel (Desktop) */}
      <div className="z-10 w-full md:w-80 bg-zinc-900/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-500 leading-tight">MINESWEEPER <span className="text-white block">CUBIC GENESIS</span></h1>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">SECURE NEURAL LINK ACTIVE</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-zinc-800 pb-1">
              <span>Mission Stats</span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${board?.status === 'PLAYING' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-700/30">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mb-1 uppercase font-bold">
                  <Clock size={10} /> Time
                </div>
                <div className="text-xl font-mono text-blue-400 leading-none">{timer}s</div>
              </div>
              <div className="bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-700/30">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mb-1 uppercase font-bold">
                  <Target size={10} /> Mines
                </div>
                <div className="text-xl font-mono text-amber-400 leading-none">
                  {Math.max(0, (board?.mineCount || 0) - flaggedCount)}
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/40 p-3 rounded-lg border border-zinc-700/30">
              <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Grid Status</div>
              <div className={`text-sm font-black tracking-wider ${
                board?.status === 'WON' ? 'text-green-500' : 
                board?.status === 'LOST' ? 'text-red-500' : 'text-blue-500'
              }`}>
                {getStatusText()}
              </div>
            </div>
          </div>

          {/* Slicers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-zinc-800 pb-1">
              <Scissors size={12} className="text-blue-500" />
              <span>Dimensional Slicing</span>
            </div>
            <div className="space-y-3 bg-zinc-800/20 p-3 rounded-xl border border-zinc-700/20">
              <SlicerControl label="X-Axis Depth" range={xRange} setRange={setXRange} max={currentSize - 1} />
              <SlicerControl label="Y-Axis Elevation" range={yRange} setRange={setYRange} max={currentSize - 1} />
              <SlicerControl label="Z-Axis Lateral" range={zRange} setRange={setZRange} max={currentSize - 1} />
              <button 
                onClick={() => {
                  setXRange([0, currentSize - 1]);
                  setYRange([0, currentSize - 1]);
                  setZRange([0, currentSize - 1]);
                }}
                className="w-full text-[9px] text-zinc-500 hover:text-white uppercase font-bold mt-1 text-center transition-colors"
              >
                Reset Slices
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-zinc-800 pb-1">Matrix Setup</div>
            <div className="flex gap-1.5">
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); setTimer(0); }}
                  className={`flex-1 py-2 text-[10px] font-black rounded transition-all border ${
                    difficulty === d 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { initGame(difficulty); setTimer(0); setAdvice(null); }}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-black uppercase text-[11px] rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <RefreshCw size={14} /> Re-Initialize
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-blue-500 font-black text-[11px] uppercase tracking-wider italic">
            <Cpu size={14} /> Tactical AI
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl min-h-[80px] flex flex-col justify-between">
            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
              {advice || "Standard protocols active. Awaiting tactical request."}
            </p>
            <button
              onClick={handleConsultAI}
              disabled={isConsulting || board?.status !== 'PLAYING'}
              className="mt-3 w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 disabled:opacity-30 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/20 flex items-center justify-center gap-2 uppercase tracking-widest transition-colors"
            >
              <Zap size={12} className={isConsulting ? 'animate-spin' : ''} />
              {isConsulting ? 'Analyzing...' : 'Oracle Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D Game Area */}
      <div className="flex-1 relative bg-[#0a0a0c]">
        <GameScene 
          board={board} 
          onReveal={revealCell} 
          onFlag={flagCell} 
          xRange={xRange}
          yRange={yRange}
          zRange={zRange}
        />
        
        {/* Game End Overlay */}
        {board && (board.status === 'WON' || board.status === 'LOST') && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-500">
            <div className="text-center p-10 rounded-3xl border border-zinc-700 bg-zinc-900/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm mx-auto">
              {board.status === 'WON' ? (
                <>
                  <Trophy className="mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={72} />
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">CUBE CLEARED</h2>
                  <p className="text-zinc-400 mb-8 text-sm font-medium">Neural pathways synchronized in {timer}s.</p>
                </>
              ) : (
                <>
                  <Skull className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" size={72} />
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">NEURAL FAILURE</h2>
                  <p className="text-zinc-400 mb-8 text-sm font-medium">Matrix collapse detected.</p>
                </>
              )}
              <button 
                onClick={() => { initGame(difficulty); setTimer(0); setAdvice(null); }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl text-xs"
              >
                Restart Simulation
              </button>
            </div>
          </div>
        )}

        {/* Interaction Info */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-zinc-800 text-zinc-500 text-[9px] uppercase font-black tracking-[0.2em] shadow-2xl">
          <div className="flex items-center gap-2"><span className="text-blue-500">LMB</span> Reveal</div>
          <div className="flex items-center gap-2"><span className="text-amber-500">RMB</span> Flag</div>
          <div className="flex items-center gap-2"><span className="text-zinc-300">DRAG</span> Orbit</div>
          <div className="flex items-center gap-2"><span className="text-zinc-300">SCROLL</span> Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default App;
