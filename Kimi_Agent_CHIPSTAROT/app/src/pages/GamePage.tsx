import { useEffect, useRef, useState } from 'react';

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore] = useState(() => parseInt(localStorage.getItem('chipstarot_highscore') || '0'));
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const gameRef = useRef<any>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    g.running = false;

    const GROUND = canvas.height - 60;
    const resetGame = () => {
      g.chicken = { x: 80, y: GROUND, vy: 0, jumping: false };
      g.obstacles = [];
      g.frameCount = 0;
      g.score = 0;
      g.speed = 5;
    };

    const jump = () => {
      if (g.chicken && !g.chicken.jumping) {
        g.chicken.vy = -14;
        g.chicken.jumping = true;
      }
    };

    const startGame = () => {
      resetGame();
      g.running = true;
      setGameState('playing');
      loop();
    };

    const loop = () => {
      if (!g.running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#1a0533';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2d1b69';
      ctx.fillRect(0, GROUND + 30, canvas.width, canvas.height);

      // Ground line
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 30);
      ctx.lineTo(canvas.width, GROUND + 30);
      ctx.stroke();

      // Chicken (simple rect)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(g.chicken.x, g.chicken.y, 32, 40);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(g.chicken.x + 4, g.chicken.y + 4, 12, 12);

      // Gravity
      g.chicken.vy += 0.7;
      g.chicken.y += g.chicken.vy;
      if (g.chicken.y >= GROUND) {
        g.chicken.y = GROUND;
        g.chicken.vy = 0;
        g.chicken.jumping = false;
      }

      // Obstacles
      g.frameCount++;
      if (g.frameCount % 90 === 0) {
        g.obstacles.push({ x: canvas.width, y: GROUND, w: 20, h: 40 + Math.random() * 20 });
        if (g.frameCount % 300 === 0) g.speed = Math.min(g.speed + 0.5, 12);
      }

      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const obs = g.obstacles[i];
        obs.x -= g.speed;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(obs.x, obs.y - obs.h + 40, obs.w, obs.h);

        // Collision
        if (
          g.chicken.x + 28 > obs.x + 4 &&
          g.chicken.x + 4 < obs.x + obs.w - 4 &&
          g.chicken.y + 36 > obs.y - obs.h + 40
        ) {
          g.running = false;
          const finalScore = Math.floor(g.score);
          const saved = parseInt(localStorage.getItem('chipstarot_highscore') || '0');
          if (finalScore > saved) localStorage.setItem('chipstarot_highscore', String(finalScore));
          setScore(finalScore);
          setGameState('gameover');
          return;
        }

        if (obs.x + obs.w < 0) g.obstacles.splice(i, 1);
      }

      // Score
      g.score += 0.1;
      setScore(Math.floor(g.score));

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${Math.floor(g.score)}`, canvas.width - 80, 30);

      requestAnimationFrame(loop);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') startGame();
        else jump();
      }
    };
    const handleClick = () => {
      if (gameState === 'idle' || gameState === 'gameover') startGame();
      else jump();
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleClick);

    // Draw idle screen
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐥 CHIPSTAROT RUNNER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText('Nhấn SPACE hoặc Click để bắt đầu', canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';

    g.startGame = startGame;
    g.jump = jump;

    return () => {
      g.running = false;
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">🎮 CHIPSTAROT Runner</h1>
      <p className="text-purple-200 text-sm mb-6">Nhấn SPACE hoặc Click để nhảy qua chướng ngại vật!</p>

      <div className="flex gap-8 mb-4">
        <div className="text-center"><p className="text-purple-300 text-xs">Điểm hiện tại</p><p className="text-white font-bold text-2xl">{score}</p></div>
        <div className="text-center"><p className="text-purple-300 text-xs">Cao nhất</p><p className="text-yellow-400 font-bold text-2xl">{highScore}</p></div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="rounded-2xl border-2 border-yellow-400/30 shadow-2xl cursor-pointer max-w-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {gameState === 'gameover' && (
        <div className="mt-6 text-center">
          <p className="text-white text-lg font-semibold">Game Over! Điểm: <span className="text-yellow-400">{score}</span></p>
          <button onClick={() => setGameState('idle')} className="btn-3d-yellow mt-3">🔄 Chơi lại</button>
        </div>
      )}

      {gameState === 'idle' && (
        <button onClick={() => setGameState('playing')} className="btn-3d-yellow mt-6">▶️ Bắt đầu</button>
      )}
    </div>
  );
}
