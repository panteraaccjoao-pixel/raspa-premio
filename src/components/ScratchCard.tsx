"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  prize: number;
  onRevealed: () => void;
}

export default function ScratchCard({ prize, onRevealed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#4a4a6a");
    grad.addColorStop(1, "#2a2a3a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#ffffff44";
    ctx.textAlign = "center";
    ctx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "13px Arial";
    ctx.fillText("← arraste para revelar →", canvas.width / 2, canvas.height / 2 + 15);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function scratch(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || revealed) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    checkProgress();
  }

  function checkProgress() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const pct = (transparent / (canvas.width * canvas.height)) * 100;
    setProgress(pct);

    if (pct > 65 && !revealed) {
      setRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onRevealed();
    }
  }

  return (
    <div className="relative w-full max-w-xs mx-auto select-none">
      <div className="relative rounded-2xl overflow-hidden border-2 border-white/20" style={{ aspectRatio: "1.6" }}>
        {/* Prize behind the scratch layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          {prize > 0 ? (
            <div className={`text-center ${revealed ? "win-pop" : "opacity-0"}`}>
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-white/60 text-sm">Você ganhou</div>
              <div className="text-4xl font-black text-green-400">
                R$ {prize.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className={`text-center ${revealed ? "win-pop" : "opacity-0"}`}>
              <div className="text-5xl mb-2">😔</div>
              <div className="text-white/60 text-sm">Não foi dessa vez</div>
              <div className="text-2xl font-bold text-white/40">Tente novamente!</div>
            </div>
          )}
        </div>

        {/* Scratch overlay */}
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          className="absolute inset-0 w-full h-full scratch-canvas"
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={scratch}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={scratch}
        />
      </div>

      {!revealed && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-center text-white/40 text-xs mt-1">
            {progress < 30 ? "Continue raspando..." : progress < 65 ? "Quase lá!" : "Revelando..."}
          </p>
        </div>
      )}
    </div>
  );
}
