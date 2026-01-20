
import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import GameScene from './components/GameScene';
import { Difficulty, GameStatus } from './types';
import { getTacticalAdvice } from './services/geminiService';
import { Trophy, Skull, Zap, Info, RefreshCw, Cpu, Clock, Target } from 'lucide-react';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const { board, revealCell, flagCell, initGame } = useGameLogic(difficulty);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [timer, setTimer] = useState(0);

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

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col md:flex-row">
      {/* HUD Header (Mobile) / Left Panel (Desktop) */}
      <div className="z-10 w-full md:w-80 bg-zinc-900/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-zinc-700 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-blue-500 mb-1">MINESWEEPER <span className="text-white">3D</span></h1>
            <p className="text-xs text-zinc-500 font-mono">NEURAL INTERFACE V3.1.0</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-2">
              <span>Telemetry</span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${board?.status === 'PLAYING' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase font-bold">
                  <Clock size={12} /> Time
                </div>
                <div className="text-2xl font-mono text-blue-400 leading-none">
                  {timer}s
                </div>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase font-bold">
                  <Target size={12} /> Mines
                </div>
                <div className="text-2xl font-mono text-amber-400 leading-none">
                  {Math.max(0, (board?.mineCount || 0) - flaggedCount)}
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
              <div className="text-xs text-zinc-500 uppercase font-bold mb-2">Systems Status</div>
              <div className={`text-lg font-black tracking-tight ${
                board?.status === 'WON' ? 'text-green-500' : 
                board?.status === 'LOST' ? 'text-red-500' : 'text-blue-500'
              }`}>
                {getStatusText()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-2">Configuration</div>
            <div className="flex gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); setTimer(0); }}
                  className={`flex-1 py-2 text-xs font-bold rounded transition-all border ${
                    difficulty === d 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { initGame(difficulty); setTimer(0); setAdvice(null); }}
              className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-black uppercase text-sm rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
            >
              <RefreshCw size={18} /> Re-Initialize
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-blue-500 font-black text-sm uppercase italic">
            <Cpu size={16} /> Gemini Tactical Advisor
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg min-h-[100px] flex flex-col justify-between">
            <p className="text-sm text-zinc-300 leading-relaxed">
              {advice || "No tactical data received yet. Initiate scan for guidance."}
            </p>
            <button
              onClick={handleConsultAI}
              disabled={isConsulting || board?.status !== 'PLAYING'}
              className="mt-4 w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-50 text-blue-400 text-xs font-bold rounded border border-blue-500/30 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Zap size={14} className={isConsulting ? 'animate-spin' : ''} />
              {isConsulting ? 'Analyzing...' : 'Request Advice'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D Game Area */}
      <div className="flex-1 relative">
        <GameScene board={board} onReveal={revealCell} onFlag={flagCell} />
        
        {/* Game End Overlay */}
        {board && (board.status === 'WON' || board.status === 'LOST') && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 rounded-2xl border-2 animate-in fade-in zoom-in duration-300 pointer-events-auto bg-zinc-900 shadow-2xl border-zinc-700">
              {board.status === 'WON' ? (
                <>
                  <Trophy className="mx-auto text-yellow-400 mb-4 animate-bounce" size={64} />
                  <h2 className="text-5xl font-black text-white mb-2 italic">VICTORY</h2>
                  <p className="text-zinc-400 mb-6">The cubic matrix has been decoded in {timer}s.</p>
                </>
              ) : (
                <>
                  <Skull className="mx-auto text-red-500 mb-4 animate-pulse" size={64} />
                  <h2 className="text-5xl font-black text-white mb-2 italic">TERMINATED</h2>
                  <p className="text-zinc-400 mb-6">Structural integrity compromised.</p>
                </>
              )}
              <button 
                onClick={() => { initGame(difficulty); setTimer(0); setAdvice(null); }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full uppercase tracking-widest transition-transform active:scale-95"
              >
                Restart Simulation
              </button>
            </div>
          </div>
        )}

        {/* Interaction Info */}
        <div className="absolute bottom-6 right-6 flex items-center gap-6 bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-zinc-400 text-xs uppercase font-bold tracking-widest">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded border-2 border-white/20 flex items-center justify-center font-mono text-[10px]">LMB</div> Reveal</div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded border-2 border-white/20 flex items-center justify-center font-mono text-[10px]">RMB</div> Flag</div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded border-2 border-white/20 flex items-center justify-center font-mono text-[10px]">DRG</div> Rotate</div>
        </div>
      </div>
    </div>
  );
};

export default App;
