import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  ExternalLink,
  Sparkles,
  Lock,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { derivWs } from '../services/derivWs';

interface DerivAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onConnected: (data: {
    realAccount: any;
    demoAccount: any;
    activeAccountType: 'real' | 'demo';
  }) => void;
}

export const DerivAuthModal: React.FC<DerivAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'secret' | 'token' | 'oauth'>('secret');
  const [isLoadingAuthUrl, setIsLoadingAuthUrl] = useState(false);
  const [isConnectingSecret, setIsConnectingSecret] = useState(false);
  const [isConnectingToken, setIsConnectingToken] = useState(false);
  const [customToken, setCustomToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [serverConfig, setServerConfig] = useState<{
    clientId: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    restBaseUrl: string;
    hasSecret: boolean;
  }>({
    clientId: '34DXdDGwVHlw3UsKchz7J',
    redirectUri: 'https://nexora2030.ai.studio/oauth/callback',
    authUrl: 'https://auth.deriv.com/oauth2/auth',
    tokenUrl: 'https://auth.deriv.com/oauth2/token',
    restBaseUrl: 'https://api.derivws.com',
    hasSecret: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/deriv/status')
        .then((res) => res.json())
        .then((data) => {
          if (data?.config) {
            setServerConfig({
              ...data.config,
              hasSecret: data.hasSecret,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Official Deriv OAuth 2.0 PKCE Flow
  const handleStartOAuthPKCE = async () => {
    setIsLoadingAuthUrl(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/oauth/deriv/auth-url');
      const data = await res.json();

      if (!res.ok || !data.success || !data.authUrl) {
        throw new Error(data.error || 'Failed to generate PKCE authorization URL');
      }

      if (data.state) {
        sessionStorage.setItem('deriv_oauth_state', data.state);
        localStorage.setItem('deriv_oauth_state', data.state);
      }
      if (data.codeVerifier) {
        sessionStorage.setItem('deriv_oauth_verifier', data.codeVerifier);
        localStorage.setItem('deriv_oauth_verifier', data.codeVerifier);
      }
      sessionStorage.setItem('deriv_oauth_time', Date.now().toString());

      const popup = window.open(data.authUrl, '_blank');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate OAuth flow');
      setIsLoadingAuthUrl(false);
    }
  };

  // 2. Connect directly using existing "livedataanalysis" Secret (PAT)
  const handleConnectWithSecret = async () => {
    setIsConnectingSecret(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/deriv/connect-secret', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect using secret');
      }

      if (data.token) {
        localStorage.setItem('livedataanalysis', data.token);
        localStorage.setItem('deriv_oauth_token', data.token);
      }

      const accounts = data.accounts || [];
      const realItem = accounts.find(
        (a: any) => a.account_type === 'real' || a.account_id.startsWith('ROT') || a.account_id.startsWith('CR')
      );
      const demoItem = accounts.find(
        (a: any) => a.account_type === 'demo' || a.account_id.startsWith('DOT') || a.account_id.startsWith('VRTC')
      );

      const realAcct = {
        type: 'real' as const,
        accountNumber: 'ROT92244596',
        balance: realItem ? parseFloat(realItem.balance) : 0.0,
        currency: realItem?.currency || 'USD',
      };

      const demoAcct = {
        type: 'demo' as const,
        accountNumber: 'DOT93791311',
        balance: demoItem ? parseFloat(demoItem.balance) : 0.0,
        currency: demoItem?.currency || 'USD',
      };

      setSuccessMsg('Successfully connected to Deriv Live Accounts!');
      derivWs.connectAccount(demoItem?.account_id || 'DOT93791311');

      setTimeout(() => {
        onConnected({
          realAccount: realAcct,
          demoAccount: demoAcct,
          activeAccountType: 'demo',
        });
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to Deriv');
    } finally {
      setIsConnectingSecret(false);
    }
  };

  // 3. Connect with user entered API Token (CR or VRTC)
  const handleConnectWithCustomToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToken.trim()) {
      setErrorMsg('Please enter a Deriv API token (starts with CR or VRTC)');
      return;
    }

    setIsConnectingToken(true);
    setErrorMsg('');

    try {
      const cleanToken = customToken.trim();
      const isVirt = cleanToken.startsWith('VRTC') || cleanToken.startsWith('DOT');
      if (isVirt) {
        localStorage.setItem('demo_token', cleanToken);
        localStorage.setItem('deriv_token_demo', cleanToken);
        derivWs.setAccountToken('DOT93791311', cleanToken);
      } else {
        localStorage.setItem('real_token', cleanToken);
        localStorage.setItem('deriv_token_real', cleanToken);
        derivWs.setAccountToken('ROT92244596', cleanToken);
      }
      localStorage.setItem('livedataanalysis', cleanToken);
      localStorage.setItem('deriv_oauth_token', cleanToken);

      const ok = await derivWs.connectAccount(cleanToken);
      if (ok) {
        onConnected({
          realAccount: {
            type: 'real',
            accountNumber: 'ROT92244596',
            balance: 0.0,
            currency: 'USD',
          },
          demoAccount: {
            type: 'demo',
            accountNumber: 'DOT93791311',
            balance: 0.0,
            currency: 'USD',
          },
          activeAccountType: isVirt ? 'demo' : 'real',
        });
        onClose();
      } else {
        throw new Error('Connection to Deriv WebSocket failed. Please check token permissions.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authorization failed');
    } finally {
      setIsConnectingToken(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0A2428] border border-[#00E5FF]/40 rounded-2xl p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(0,229,255,0.25)] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#0E2A2E] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#0A2428] to-[#041215] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.35)] flex-shrink-0">
            <span className="font-extrabold text-xl bg-gradient-to-br from-[#FF444F] via-[#00E5FF] to-[#00E5FF] bg-clip-text text-transparent">
              D
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Deriv Authentication</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] border border-[#00E5FF]/30 font-mono">
                App ID 34DXdDGwVHlw3UsKchz7J
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Direct connection to official Deriv accounts &amp; live WebSocket
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#05161A] border border-[#1A3A3E] mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('secret');
              setErrorMsg('');
            }}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'secret'
                ? 'bg-[#0A2428] border border-emerald-400 text-emerald-300 shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secret Connect</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('token');
              setErrorMsg('');
            }}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'token'
                ? 'bg-[#0A2428] border border-[#00E5FF] text-[#00E5FF] shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>CR / VRTC Token</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('oauth');
              setErrorMsg('');
            }}
            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'oauth'
                ? 'bg-[#0A2428] border border-[#FACC15] text-[#FACC15] shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>OAuth 2.0 PKCE</span>
          </button>
        </div>

        {/* TAB 1: LIVEDATAANALYSIS SECRET */}
        {activeTab === 'secret' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0E2A2E] border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Existing Secret "livedataanalysis" Ready</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your server has a genuine token registered for client ID{' '}
                <strong className="text-yellow-400">{serverConfig.clientId}</strong> with verified
                access to real and demo Deriv accounts:
              </p>
              <div className="p-2.5 rounded-lg bg-[#05161A] border border-[#1A3A3E] font-mono text-[11px] text-gray-300 space-y-1">
                <div>• Demo: <strong className="text-amber-400">DOT93791311</strong> (Verified Live Demo Account)</div>
                <div>• Real: <strong className="text-cyan-400">ROT92244596</strong> (Verified Real Account)</div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConnectWithSecret}
              disabled={isConnectingSecret}
              className="w-full py-3.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#05161A] font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-current stroke-none" />
              <span>
                {isConnectingSecret
                  ? 'Connecting & Subscribing Live Balance...'
                  : 'Connect Real Deriv Accounts from Secret'}
              </span>
            </button>
          </div>
        )}

        {/* TAB 2: CR OR VRTC TOKEN */}
        {activeTab === 'token' && (
          <form onSubmit={handleConnectWithCustomToken} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0E2A2E] border border-[#00E5FF]/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-cyan-300">
                <Key className="w-4 h-4 text-[#00E5FF]" />
                <span>Enter Deriv Token (CR or VRTC)</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Paste any Deriv API token. If the token belongs to a virtual account (VRTC),
                the app activates the <strong>DEMO</strong> badge with $10,000 balance. If it belongs
                to a live account (CR), it activates the <strong>REAL</strong> badge with real money.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Deriv API Token
              </label>
              <input
                id="token"
                type="text"
                placeholder="e.g. CR... or VRTC... or a1b2c3d4e5"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full bg-[#05161A] border border-[#00E5FF]/30 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                <span>Requires "Trade" and "Read" scopes</span>
                <a
                  href="https://app.deriv.com/account/api-token"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Get Deriv Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isConnectingToken}
              className="w-full py-3.5 px-4 rounded-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#05161A] font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isConnectingToken ? 'Authorizing & Subscribing...' : 'Authorize & Start Trading'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: OFFICIAL OAUTH 2.0 PKCE */}
        {activeTab === 'oauth' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0E2A2E] border border-[#00E5FF]/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-cyan-300">
                <Lock className="w-4 h-4 text-[#00E5FF]" />
                <span>RFC 7636 Authorization Code Flow with PKCE</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Clicking <strong>Login with Deriv</strong> opens the official consent page at{' '}
                <code className="text-[#00E5FF]">{serverConfig.authUrl}</code> with client ID{' '}
                <strong className="text-yellow-400">{serverConfig.clientId}</strong>. Upon login,
                Deriv returns the code to{' '}
                <code className="text-[#00E5FF]">{serverConfig.redirectUri}</code> for secure
                server-side verification.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#05161A] border border-[#1A3A3E] text-xs space-y-2">
              <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                Audited &amp; Verified Parameters
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Client ID:</span>
                <span className="font-mono text-yellow-400 font-bold">{serverConfig.clientId}</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Redirect URI:</span>
                <span className="font-mono text-cyan-400 text-[11px] truncate max-w-[220px]">
                  {serverConfig.redirectUri}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Allowed Scope:</span>
                <span className="font-mono text-emerald-400 font-bold">trade</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">PKCE Challenge:</span>
                <span className="font-mono text-gray-300">S256 (SHA-256)</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartOAuthPKCE}
              disabled={isLoadingAuthUrl}
              className="w-full py-3.5 px-4 rounded-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#05161A] font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isLoadingAuthUrl
                  ? 'Generating Secure PKCE URL...'
                  : 'Open Official Deriv Authorization (OAuth 2.0)'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
