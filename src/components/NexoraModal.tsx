import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function setupNexoraModalGlobal(onAcknowledgeCallback?: () => void) {
  if (typeof window === 'undefined') return;

  (window as any).showNexoraModal = (
    type: 'stop' | 'reset' | 'profit' | 'loss',
    profit: number,
    trades: number,
    wins: number,
    losses: number
  ) => {
    const modal = document.getElementById('nexoraModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const emoji = document.getElementById('modalEmoji');
    const btn = document.getElementById('modalBtn');
    const profitEl = document.getElementById('modalProfit');
    const tradesEl = document.getElementById('modalTrades');
    const winsEl = document.getElementById('modalWins');
    const lossesEl = document.getElementById('modalLosses');

    if (!modal) return;

    if (type === 'stop') {
      if (title) title.innerText = 'Trading Stopped';
      if (desc) desc.innerText = 'Nexora AI has stopped trading. You can start a new session anytime.';
      if (emoji) emoji.innerText = '🛑';
      if (btn) {
        btn.style.background = '#666';
        btn.innerText = 'Close';
      }
    } else if (type === 'reset') {
      if (title) title.innerText = 'Session Reset';
      if (desc) desc.innerText = 'Your trading session has been reset. All stats cleared.';
      if (emoji) emoji.innerText = '🔄';
      if (btn) {
        btn.style.background = '#2196F3';
        btn.innerText = 'Done';
      }
    } else if (type === 'profit') {
      if (title) title.innerText = 'Congratulations! 🎉';
      if (desc) desc.innerText = "You've reached your target profit. Nexora AI has stopped trading to lock in your gains. Great session!";
      if (emoji) emoji.innerText = '🎉';
      if (btn) {
        btn.style.background = '#00c853';
        btn.innerText = 'Awesome';
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22C55E', '#00E5FF', '#FACC15'],
        });
      } catch {}
    } else if (type === 'loss') {
      if (title) title.innerText = 'Stop Loss Reached';
      if (desc) desc.innerText = 'Max loss limit reached. Trading stopped to protect your capital.';
      if (emoji) emoji.innerText = '⚠️';
      if (btn) {
        btn.style.background = '#f44336';
        btn.innerText = 'Acknowledge';
      }
    }

    if (profitEl) {
      profitEl.innerText = (profit >= 0 ? '+' : '') + profit.toFixed(2) + ' USD';
      profitEl.style.color = profit >= 0 ? '#00c853' : '#dc2626';
    }
    if (tradesEl) tradesEl.innerText = String(trades);
    if (winsEl) winsEl.innerText = String(wins);
    if (lossesEl) lossesEl.innerText = String(losses);

    modal.style.display = 'flex';
  };
}

interface NexoraModalProps {
  onAcknowledge?: () => void;
}

export const NexoraModal: React.FC<NexoraModalProps> = ({ onAcknowledge }) => {
  useEffect(() => {
    setupNexoraModalGlobal(onAcknowledge);
  }, [onAcknowledge]);

  const handleClose = () => {
    const modal = document.getElementById('nexoraModal');
    if (modal) modal.style.display = 'none';
    if (onAcknowledge) onAcknowledge();
  };

  return (
    <div
      id="nexoraModal"
      style={{
        display: 'none',
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: '56px', marginBottom: '10px' }} id="modalEmoji">
          🎉
        </div>
        <h2
          style={{
            color: 'black',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 10px',
          }}
          id="modalTitle"
        >
          Congratulations! 🎉
        </h2>
        <p
          style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: 1.5,
            margin: '0 0 20px',
          }}
          id="modalDesc"
        >
          You've reached your target profit. Nexora AI has stopped trading to lock in your gains. Great session!
        </p>

        <div
          style={{
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '11px', fontWeight: 600 }}>NET PROFIT</div>
            <div
              style={{ color: 'black', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}
              id="modalProfit"
            >
              +0.00 USD
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '11px', fontWeight: 600 }}>TRADES</div>
            <div style={{ color: 'black', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }} id="modalTrades">
              0
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '11px', fontWeight: 600 }}>WINS</div>
            <div style={{ color: '#00c853', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }} id="modalWins">
              0
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '11px', fontWeight: 600 }}>LOSSES</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }} id="modalLosses">
              0
            </div>
          </div>
        </div>

        <button
          id="modalBtn"
          onClick={handleClose}
          style={{
            background: '#00c853',
            color: 'white',
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          Awesome
        </button>
      </div>
    </div>
  );
};
