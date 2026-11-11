import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TradingStats } from '../types';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TradingStats;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  useEffect(() => {
    // Bind global functions as requested
    (window as any).closeCongrats = () => {
      const modal = document.getElementById('congrats-modal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      onClose();
    };

    (window as any).checkTarget = (totalProfit?: number) => {
      const profit = totalProfit ?? (stats?.totalPL || 0);
      if (profit >= 5000 || profit >= 100) {
        const modal = document.getElementById('congrats-modal');
        if (modal) {
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      }
    };
  }, [onClose, stats]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Fire confetti bursts
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00E676', '#22C55E', '#00E5FF', '#FACC15', '#A855F7'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00E676', '#00E5FF'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#00E676', '#FACC15'],
          });
        }, 300);
      } catch {
        // ignore if canvas confetti unavailable
      }
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const netPL = stats?.totalPL ?? 0;
  const formattedProfit = Math.abs(netPL).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = netPL >= 0 ? '+' : '-';
  const displayProfit = `${prefix}${formattedProfit} USD`;

  // Always render in DOM with display controlled so document.getElementById('congrats-modal') always works
  return (
    <div
      id="congrats-modal"
      style={{
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          background: 'white',
          width: '90%',
          maxWidth: '380px',
          borderRadius: '22px',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {/* Top Right Close Button */}
        <div
          onClick={() => {
            if ((window as any).closeCongrats) (window as any).closeCongrats();
            else onClose();
          }}
          style={{
            position: 'absolute',
            top: '18px',
            right: '22px',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999',
            lineHeight: 1,
            userSelect: 'none',
          }}
          aria-label="Close"
        >
          ✕
        </div>

        {/* Emojicon Circle */}
        <div
          style={{
            width: '60px',
            height: '60px',
            background: '#E8F5F9',
            borderRadius: '50%',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          🎉
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 6px 0' }}>
          Congratulations! 🎉
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '13px',
            color: '#666',
            margin: '10px 0 18px',
            lineHeight: 1.4,
          }}
        >
          You've reached your target profit. Nexora AI has stopped trading to lock in your gains. Great session!
        </p>

        {/* Net Profit & Stats Box */}
        <div
          style={{
            background: '#F7F7F8',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#888', overflow: 'hidden' }}>
            Net profit{' '}
            <span
              id="net-profit"
              style={{
                float: 'right',
                fontWeight: 700,
                color: netPL >= 0 ? '#111' : '#E53935',
              }}
            >
              {displayProfit}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              textAlign: 'center',
            }}
          >
            <div>
              <b id="trade-count" style={{ color: '#111', fontSize: '15px' }}>
                {stats?.numberOfRuns ?? 18}
              </b>
              <br />
              <span style={{ fontSize: '11px', color: '#888' }}>Trades</span>
            </div>
            <div>
              <b id="win-count" style={{ color: '#111', fontSize: '15px' }}>
                {stats?.contractsWon ?? 15}
              </b>
              <br />
              <span style={{ fontSize: '11px', color: '#888' }}>Wins</span>
            </div>
            <div>
              <b id="loss-count" style={{ color: '#E53935', fontSize: '15px' }}>
                {stats?.contractsLost ?? 3}
              </b>
              <br />
              <span style={{ fontSize: '11px', color: '#888' }}>Losses</span>
            </div>
          </div>
        </div>

        {/* Button: Awesome */}
        <button
          onClick={() => {
            if ((window as any).closeCongrats) (window as any).closeCongrats();
            else onClose();
          }}
          style={{
            width: '100%',
            height: '52px',
            background: '#00E676',
            border: 'none',
            borderRadius: '26px',
            fontWeight: 700,
            fontSize: '15px',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,230,118,0.3)',
          }}
        >
          Awesome
        </button>
      </div>
    </div>
  );
};
