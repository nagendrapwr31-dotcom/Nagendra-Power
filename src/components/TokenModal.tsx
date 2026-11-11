import React, { useState } from 'react';
import { X, Key, Shield, ExternalLink, Check, Sparkles } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitToken: (token: string, accountType: 'real' | 'demo') => void;
  onUseDemoSandbox: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  onSubmitToken,
  onUseDemoSandbox,
}) => {
  const [token, setToken] = useState('');
  const [accountType, setAccountType] = useState<'real' | 'demo'>('real');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('Please enter a valid Deriv API token');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSubmitToken(token.trim(), accountType);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authorization failed. Please check your token permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A2428] border border-[#00E5FF]/40 rounded-2xl p-6 text-white shadow-[0_0_40px_rgba(0,229,255,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#0E2A2E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Authorize Deriv Account</h3>
            <p className="text-xs text-gray-400">Direct WebSocket connection with 1089 app_id</p>
          </div>
        </div>

        {/* Important Options Account Notice */}
        <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>⚡ Options Balance Sync</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Must transfer funds from <strong className="text-white">Deriv Wallet → Options</strong> in your Deriv app first. Nexora synchronizes with your Deriv Options balance (e.g. 300.00 USD) and updates in real-time as profits lock in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Target Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Account Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('real')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  accountType === 'real'
                    ? 'bg-[#0E2A2E] border-[#00E5FF] text-[#00E5FF] shadow-xs'
                    : 'bg-[#0A2428] border-[#1A3A3E] text-gray-400 hover:text-white'
                }`}
              >
                Real Account (Live)
              </button>
              <button
                type="button"
                onClick={() => setAccountType('demo')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  accountType === 'demo'
                    ? 'bg-[#0E2A2E] border-amber-400 text-amber-300 shadow-xs'
                    : 'bg-[#0A2428] border-[#1A3A3E] text-gray-400 hover:text-white'
                }`}
              >
                Demo Account (Virtual)
              </button>
            </div>
          </div>

          {/* Token Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Deriv API Token
            </label>
            <input
              id="token"
              type="password"
              placeholder="e.g. 1a2b3c4d5e6f7g8h"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#0E2A2E] border border-[#00E5FF]/30 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
              <span>Required scopes: Read, Trade</span>
              <a
                href="https://app.deriv.com/account/api-token"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Generate token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#05161A] font-extrabold text-sm transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Authorize with Token'}
          </button>

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A3A3E]" />
            </div>
            <span className="relative px-3 bg-[#0A2428] text-xs text-gray-400 uppercase font-mono">
              or Deriv OAuth / Sandbox
            </span>
          </div>

          {/* Deriv OAuth Button matching official flow */}
          <button
            id="derivLoginBtnModal"
            type="button"
            onClick={async () => {
              try {
                localStorage.removeItem('nexora_logged_out');
                const res = await fetch('/api/oauth/deriv/auth-url');
                const data = await res.json();
                if (data?.authUrl) {
                  if (data.state) {
                    sessionStorage.setItem('deriv_oauth_state', data.state);
                    localStorage.setItem('deriv_oauth_state', data.state);
                  }
                  if (data.codeVerifier) {
                    sessionStorage.setItem('deriv_oauth_verifier', data.codeVerifier);
                    localStorage.setItem('deriv_oauth_verifier', data.codeVerifier);
                  }
                  const isInIframe = window.self !== window.top;
                  if (isInIframe) {
                    const authWin = window.open(
                      data.authUrl,
                      'deriv_oauth_popup',
                      'width=620,height=750,menubar=no,toolbar=no'
                    );
                    if (authWin) {
                      onClose();
                      return;
                    }
                  }
                  window.location.href = data.authUrl;
                }
              } catch (err: any) {
                setErrorMsg('OAuth initialization error: ' + (err.message || 'Please try again'));
              }
            }}
            style={{
              background: 'linear-gradient(90deg,#00d2ff,#7d5cff)',
              color: '#fff',
              padding: '14px',
              width: '100%',
              borderRadius: '30px',
              fontWeight: 900,
              border: 0,
              cursor: 'pointer',
              fontSize: '14px',
            }}
            className="hover:opacity-95 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            → Login with Deriv (Official OAuth)
          </button>

          {/* One-click Demo Sandbox Button */}
          <button
            type="button"
            onClick={() => {
              onUseDemoSandbox();
              onClose();
            }}
            className="w-full py-2.5 rounded-full bg-[#0E2A2E] hover:bg-[#13373d] border border-[#00E5FF]/40 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span>Start with Options Sandbox ($300.00 USD)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
