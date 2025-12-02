import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type GameMode = 'slots' | 'scratch';
type GameResult = 'win' | 'loss' | null;

interface LotteryGameProps {
  isPlaying: boolean;
  gameResult: GameResult;
  onPlay: () => void;
  isApproved: boolean;
  isApproving: boolean;
  onApprove: () => void;
  ticketPrice: string;
}

export default function LotteryGame({
  isPlaying,
  gameResult,
  onPlay,
  isApproved,
  isApproving,
  onApprove,
  ticketPrice
}: LotteryGameProps) {
  const [mode, setMode] = useState<GameMode>('slots');

  return (
    <div className="flex flex-col items-center w-full">
      {/* Game Mode Switcher */}
      <div className="flex bg-black/40 p-1 rounded-lg mb-6 border border-white/5">
        <button
          onClick={() => setMode('slots')}
          className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
            mode === 'slots' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎰 Slots
        </button>
        <button
          onClick={() => setMode('scratch')}
          className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
            mode === 'scratch' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎫 Scratch Card
        </button>
      </div>

      {/* Game Area */}
      <div className="w-full mb-6 min-h-[200px] flex items-center justify-center">
        {mode === 'slots' ? (
          <SlotMachine isPlaying={isPlaying} result={gameResult} />
        ) : (
          <ScratchCard isPlaying={isPlaying} result={gameResult} />
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-xs">
        {!isApproved ? (
          <button
            onClick={onApprove}
            disabled={isApproving}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            {isApproving ? 'Approving...' : 'Approve Tokens'}
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={isPlaying}
            className={`w-full py-3 px-4 font-bold rounded-lg transition-all transform active:scale-95 shadow-lg ${
              isPlaying 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30'
            }`}
          >
            {isPlaying ? 'Processing...' : `Play for ${ticketPrice} NEX`}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Slot Machine Component ---
function SlotMachine({ isPlaying, result }: { isPlaying: boolean; result: GameResult }) {
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔'];
  // If win, show 💎💎💎. If loss, show random mismatch.
  
  const [displaySymbols, setDisplaySymbols] = useState(['7️⃣', '7️⃣', '7️⃣']);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      // Spin animation
      interval = setInterval(() => {
        setDisplaySymbols([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ]);
      }, 100);
    } else if (result) {
      // Stop spinning and show result
      if (result === 'win') {
        setDisplaySymbols(['💎', '💎', '💎']);
      } else {
        // Ensure they don't match for a loss
        setDisplaySymbols(['🍒', '🍋', '🍇']); 
      }
    }

    return () => clearInterval(interval);
  }, [isPlaying, result]);

  return (
    <div className="bg-black/80 p-4 rounded-xl border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>
      <div className="flex gap-2 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
        {displaySymbols.map((sym, i) => (
          <div key={i} className="w-16 h-24 bg-white border-2 border-gray-300 rounded flex items-center justify-center text-4xl shadow-inner">
            <motion.div
              key={isPlaying ? Math.random() : sym} // Force re-render for animation during spin
              initial={isPlaying ? { y: -20, opacity: 0.5 } : { y: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="filter drop-shadow-md"
            >
              {sym}
            </motion.div>
          </div>
        ))}
      </div>
      <div className="absolute -right-2 top-1/2 w-4 h-12 bg-red-600 rounded-r-lg transform -translate-y-1/2 shadow-md border-l border-red-800"></div>
    </div>
  );
}

// --- Scratch Card Component ---
function ScratchCard({ isPlaying, result }: { isPlaying: boolean; result: GameResult }) {
  const [isScratched, setIsScratched] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset scratch state when playing starts
  useEffect(() => {
    if (isPlaying) {
      setIsScratched(false);
      resetCanvas();
    }
  }, [isPlaying]);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#C0C0C0'; // Silver color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some texture/text
    ctx.fillStyle = '#A0A0A0';
    ctx.font = '20px Arial';
    ctx.fillText('SCRATCH HERE', 40, 75);
  };

  useEffect(() => {
    resetCanvas();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only allow scratching if we have a result and are not playing
    if (isPlaying || !result) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    setIsScratched(true);
  };

  return (
    <div className="relative w-64 h-40 bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-600 select-none">
      {/* Result Layer (Underneath) */}
      <div className="absolute inset-0 flex items-center justify-center flex-col bg-gradient-to-br from-yellow-100 to-yellow-50">
        {isPlaying ? (
          <span className="text-gray-400 animate-pulse">Printing Ticket...</span>
        ) : result === 'win' ? (
          <>
            <span className="text-4xl">🏆</span>
            <span className="text-green-600 font-bold text-xl mt-2">WINNER!</span>
          </>
        ) : result === 'loss' ? (
          <>
            <span className="text-4xl">😢</span>
            <span className="text-gray-600 font-bold text-xl mt-2">Try Again</span>
          </>
        ) : (
          <span className="text-gray-400">Ready to Play</span>
        )}
      </div>

      {/* Scratch Layer (Canvas) */}
      <canvas
        ref={canvasRef}
        width={256}
        height={160}
        className={`absolute inset-0 cursor-pointer transition-opacity duration-1000 ${
          (result && !isPlaying) ? 'opacity-100' : 'opacity-100'
        } ${isPlaying ? 'pointer-events-none' : ''}`}
        onMouseMove={(e) => {
            if (e.buttons === 1) handleMouseMove(e);
        }}
        onMouseDown={handleMouseMove}
      />
    </div>
  );
}
