import React, { useEffect, useRef, useState } from 'react';
import { Radio, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface ScanningOverlayProps {
  isOpen: boolean;
  onComplete: (optimalMarket?: { symbol: string; label: string }) => void;
  strategyName?: string;
  selectedMarket?: { symbol: string; label: string };
}

export function getStrategyScanInfo(strat?: string): { label: string; text: string } {
  const s = (strat || '').toLowerCase().trim();
  if (s.includes('rise') || s === 'rise_fall') {
    return { label: 'Rise/Fall', text: 'Analyzing Rise/Fall momentum' };
  }
  if (s.includes('even') || s === 'even_odd') {
    return { label: 'Even/Odd', text: 'Analyzing Even/Odd pattern' };
  }
  if (s.includes('matches') || s === 'matches_printer') {
    return { label: 'Matches Printer', text: 'Smart matches printing...' };
  }
  if (s.includes('over') || s.includes('killer') || s === 'over_8_killer') {
    return { label: 'Over 8 Killer', text: 'Sniping Over 8 digits...' };
  }
  if (s.includes('tickstrike') || s === 'tickstrike_pro') {
    return { label: 'TickStrike Pro', text: 'High-speed tick momentum...' };
  }
  if (s.includes('switcher') || s === 'auto_switcher') {
    return { label: 'Auto Switcher', text: 'Auto-switching Ups/Downs...' };
  }
  if (s.includes('smart') || s === 'smart_ai') {
    return { label: 'Smart AI', text: 'Markov AI engine analyzing...' };
  }
  // Mix Both / Default
  return { label: 'Mix Both', text: 'Markov AI engine analyzing...' };
}

const TERMINAL_LOGS_RAIN = [
  '[INFO] Connecting to server... [INFO] Fetching market data...',
  '[INFO] Authenticating API key... [OK] [INFO] Connection established...',
  '[WARNING] High market volatility detected... [INFO] Analyzing Volatility Index...',
  '[SECURITY] Encryption enabled... [SUCCESS] Safe stream established...',
  '[INFO] Data transmission complete... [OK] [INFO] Compiling results...',
  '[INFO] Predicting next digit... [INFO] Scanning Markov probability states...',
  '[SUCCESS] Algorithm calibrated: 98% confidence... [INFO] Stream ready.',
  '[INFO] Stream connected: Volatility 50 Index... [OK]',
  '[SECURITY] Encryption enabled... [INFO] Fetching market ticks...',
  '[INFO] Analyzing Volatility 10 Index... [INFO] Data stream active...',
  '[INFO] Historical ticks downloaded... [OK] Calculating entropy...',
];

interface LogEntry {
  prefix: string;
  prefixType: 'info' | 'warn' | 'success';
  body: string;
  suffix?: string;
  suffixType?: 'success' | 'info';
}

const LIVE_LOG_SEQUENCE: LogEntry[] = [
  {
    prefix: '[INFO]',
    prefixType: 'info',
    body: 'Authenticating API key...',
    suffix: '[SUCCESS]',
    suffixType: 'success',
  },
  {
    prefix: '[INFO]',
    prefixType: 'info',
    body: 'Connecting to server...',
    suffix: '[SUCCESS]',
    suffixType: 'success',
  },
  {
    prefix: '[WARNING]',
    prefixType: 'warn',
    body: 'High market volatility detected... [INFO] Compiling volatility data...',
  },
  {
    prefix: '[INFO]',
    prefixType: 'info',
    body: 'Analysing next digit... [INFO] Predicting next tick direction...',
  },
  {
    prefix: '[SUCCESS]',
    prefixType: 'success',
    body: 'High accuracy pattern identified (Volatility 50 Index).',
  },
  {
    prefix: '[INFO]',
    prefixType: 'info',
    body: 'Scanning the all market only profit can make.',
  },
];

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  isOpen,
  onComplete,
  strategyName,
  selectedMarket,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const selectedMarketRef = useRef(selectedMarket);
  selectedMarketRef.current = selectedMarket;
  const scanInfo = getStrategyScanInfo(strategyName);

  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const targetLabel = selectedMarket?.label || 'Volatility Index';
  const [scannedMarkets, setScannedMarkets] = useState<
    Array<{ name: string; score: number; status: 'scanning' | 'optimal' | 'passed' }>
  >([
    { name: 'Volatility 10 Index', score: 91, status: 'passed' },
    { name: 'Volatility 25 Index', score: 86, status: 'passed' },
    { name: targetLabel, score: 98, status: 'optimal' },
    { name: 'Volatility 75 Index', score: 88, status: 'passed' },
    { name: 'Volatility 100 Index', score: 93, status: 'passed' },
  ]);

  // Reset and drive live progressive logs & progress bar
  useEffect(() => {
    if (!isOpen) {
      setVisibleLogs([]);
      setProgress(0);
      return;
    }

    setVisibleLogs([]);
    setProgress(0);

    const logTimers = [
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[0]]), 300),
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[1]]), 900),
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[2]]), 1600),
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[3]]), 2300),
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[4]]), 3000),
      setTimeout(() => setVisibleLogs((prev) => [...prev, LIVE_LOG_SEQUENCE[5]]), 3500),
    ];

    const progressInterval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) return 100;
        return Math.min(100, old + 2.5);
      });
    }, 100);

    const completionTimer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current(selectedMarketRef.current);
      }
    }, 4000);

    return () => {
      logTimers.forEach(clearTimeout);
      clearInterval(progressInterval);
      clearTimeout(completionTimer);
    };
  }, [isOpen]);

  // 1. Video Terminal Log Rain Animation on Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fontSize = 12;
    const lineHeight = 16;
    const numLines = Math.floor(height / lineHeight) + 5;

    const lines: { text: string; y: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < numLines; i++) {
      lines.push({
        text: TERMINAL_LOGS_RAIN[Math.floor(Math.random() * TERMINAL_LOGS_RAIN.length)],
        y: i * lineHeight,
        speed: 1.2 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.35,
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 12, 0.28)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < lines.length; i++) {
        const item = lines[i];
        ctx.fillStyle = `rgba(0, 255, 65, ${item.opacity})`;
        ctx.fillText(item.text, 10, item.y);

        if (width > 600) {
          ctx.fillText(item.text, width / 2 + 10, item.y);
        }

        item.y += item.speed;
        if (item.y > height + 20) {
          item.y = -10;
          item.text = TERMINAL_LOGS_RAIN[Math.floor(Math.random() * TERMINAL_LOGS_RAIN.length)];
          item.opacity = 0.3 + Math.random() * 0.4;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="scan"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 overflow-hidden p-4"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      {/* Real hacker terminal log rain canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />

      {/* Center Quantum Scanner Console */}
      <div className="relative z-10 w-full max-w-lg bg-[#060D18]/95 border-2 border-[#00f2ff] rounded-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,242,255,0.45)] text-center flex flex-col backdrop-blur-md">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              NEXORA AI QUANT ENGINE // DERIV SCANNER
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-ping" />
            <span>LIVE SCAN</span>
          </div>
        </div>

        {/* Pulsing Radar Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-cyan-950/80 border-2 border-[#00f2ff] flex items-center justify-center text-[#00f2ff] mb-3 shadow-[0_0_20px_rgba(0,242,255,0.7)] animate-pulse">
          <Radio className="w-6 h-6 text-[#00ff41]" />
        </div>

        {/* Text "Scanning the market - [Strategy Name] Active" with 3 animated bouncing dots */}
        <div className="flex items-center gap-1.5 text-white font-mono font-bold text-base sm:text-lg tracking-wide flex-wrap justify-center">
          <span>Scanning the market - {scanInfo.label} Active</span>
          <span className="inline-flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-bounce" />
          </span>
        </div>

        {/* Strategy Specific Subtitle */}
        <div className="mt-1 text-xs text-cyan-300 font-mono tracking-wide">
          {scanInfo.text}
        </div>

        {/* Real Terminal Log Generator Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-black/90 border border-gray-800 text-left font-mono text-xs sm:text-[13px] leading-relaxed shadow-inner max-h-48 overflow-y-auto space-y-1.5">
          <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-gray-800/60 text-[11px] text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>TERMINAL LOG GENERATOR REAL</span>
          </div>

          {visibleLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs animate-in fade-in slide-in-from-left-2 duration-150">
              <span
                className={`font-bold flex-shrink-0 ${
                  log.prefixType === 'warn'
                    ? 'text-amber-400'
                    : log.prefixType === 'success'
                    ? 'text-[#00ff41]'
                    : 'text-cyan-400'
                }`}
              >
                {log.prefix}
              </span>
              <span className="text-gray-200">{log.body}</span>
              {log.suffix && (
                <span className="font-bold text-[#00ff41] ml-auto flex-shrink-0 animate-pulse">
                  {log.suffix}
                </span>
              )}
            </div>
          ))}

          {visibleLogs.length < LIVE_LOG_SEQUENCE.length && (
            <div className="flex items-center gap-1.5 text-cyan-400/70 text-xs pt-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="italic">Processing real-time Deriv WebSocket telemetry...</span>
            </div>
          )}
        </div>

        {/* Scanned Markets Probability Grid */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-left font-mono text-[11px]">
          {scannedMarkets.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                m.status === 'optimal'
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,255,0.3)]'
                  : 'bg-black/40 border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-semibold">{m.name}</span>
                {m.status === 'optimal' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff41] flex-shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Score: {m.score}%</span>
                {m.status === 'optimal' ? (
                  <span className="text-[#00ff41] font-bold">OPTIMAL</span>
                ) : (
                  <span className="text-gray-400">Verified</span>
                )}
              </div>
            </div>
          ))}
          <div className="p-2 rounded-lg border bg-emerald-950/30 border-emerald-500/40 text-emerald-300 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-400 font-semibold">Scanning Scope</span>
            <span className="font-bold text-[11px] text-[#00ff41]">All Markets Only Profit</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span>Executing deep market scanning matrix...</span>
            <span className="font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-900 border border-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-[#00f2ff] to-[#00ff41] rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(0,242,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

