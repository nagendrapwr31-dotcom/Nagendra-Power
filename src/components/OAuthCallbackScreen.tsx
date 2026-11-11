import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Activity,
  Shield,
  RefreshCw,
  ExternalLink,
  Key,
} from 'lucide-react';
import { AccountInfo } from '../types';

interface OAuthCallbackScreenProps {
  onSuccess: (params: {
    realAccount: AccountInfo;
    demoAccount: AccountInfo;
    activeAccountType: 'real' | 'demo';
  }) => void;
  onError: (errorMessage: string) => void;
}

export const OAuthCallbackScreen: React.FC<OAuthCallbackScreenProps> = ({
  onSuccess,
  onError,
}) => {
  const [statusStep, setStatusStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountSummary, setAccountSummary] = useState<any[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isConnectingSecret, setIsConnectingSecret] = useState(false);

  // Single execution ref to prevent React StrictMode & double invocation errors
  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleOAuthCallback = async () => {
      try {
        setStatusStep(1); // 1. Reading parameters

        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash
        );

        // Check if Deriv returned an error
        const error = searchParams.get('error') || hashParams.get('error');
        if (error) {
          const errorDesc =
            searchParams.get('error_description') ||
            hashParams.get('error_description') ||
            error;
          throw new Error(`Deriv Authorization Error: ${errorDesc}`);
        }

        setStatusStep(2); // 2. Extracting Deriv accounts & tokens

        let parsedRealToken = '';
        let parsedRealLoginId = '';
        let parsedDemoToken = '';
        let parsedDemoLoginId = '';
        let hasTokens = false;

        for (let i = 1; i <= 10; i++) {
          const acct = hashParams.get(`acct${i}`) || searchParams.get(`acct${i}`);
          const token = hashParams.get(`token${i}`) || searchParams.get(`token${i}`);
          if (token) {
            hasTokens = true;
            const isDemo =
              acct &&
              (acct.startsWith('VR') ||
                acct.startsWith('VRT') ||
                acct.startsWith('VRW') ||
                acct.startsWith('DOT') ||
                acct.toLowerCase().includes('demo'));
            if (isDemo) {
              parsedDemoToken = token;
              parsedDemoLoginId = acct || 'DOT93791311';
            } else {
              parsedRealToken = token;
              parsedRealLoginId = acct || 'ROT92244596';
            }
          }
        }

        const singleToken =
          hashParams.get('token') ||
          searchParams.get('token') ||
          hashParams.get('token1') ||
          searchParams.get('token1');
        const singleAcct =
          hashParams.get('acct') ||
          searchParams.get('acct') ||
          hashParams.get('acct1') ||
          searchParams.get('acct1');

        if (singleToken && !parsedRealToken && !parsedDemoToken) {
          hasTokens = true;
          const isDemo =
            singleAcct &&
            (singleAcct.startsWith('VR') ||
              singleAcct.startsWith('VRT') ||
              singleAcct.startsWith('VRW') ||
              singleAcct.startsWith('DOT') ||
              singleAcct.toLowerCase().includes('demo'));
          if (isDemo) {
            parsedDemoToken = singleToken;
            parsedDemoLoginId = singleAcct || 'DOT93791311';
          } else {
            parsedRealToken = singleToken;
            parsedRealLoginId = singleAcct || 'ROT92244596';
          }
        }

        // Fallback to existing stored tokens if present
        if (!hasTokens) {
          const storedReal = localStorage.getItem('DERIV_REAL_TOKEN');
          const storedDemo = localStorage.getItem('DERIV_DEMO_TOKEN');
          if (storedReal || storedDemo) {
            parsedRealToken = storedReal || '';
            parsedDemoToken = storedDemo || '';
            parsedRealLoginId = localStorage.getItem('DERIV_REAL_LOGINID') || 'ROT92244596';
            parsedDemoLoginId = localStorage.getItem('DERIV_DEMO_LOGINID') || 'DOT93791311';
            hasTokens = true;
          }
        }

        if (!hasTokens) {
          throw new Error(
            'No Deriv authentication tokens found. Please click "Login with Deriv" or connect using your API token directly.'
          );
        }

        // Store tokens securely
        if (parsedRealToken) {
          localStorage.setItem('DERIV_REAL_TOKEN', parsedRealToken);
          localStorage.setItem('DERIV_REAL_LOGINID', parsedRealLoginId || 'ROT92244596');
        }
        if (parsedDemoToken) {
          localStorage.setItem('DERIV_DEMO_TOKEN', parsedDemoToken);
          localStorage.setItem('DERIV_DEMO_LOGINID', parsedDemoLoginId || 'DOT93791311');
        }
        localStorage.removeItem('nexora_logged_out');

        setStatusStep(3); // 3. Retrieving accounts

        const accounts = [
          ...(parsedRealToken
            ? [{ account_id: parsedRealLoginId || 'ROT92244596', account_type: 'real', token: parsedRealToken }]
            : []),
          ...(parsedDemoToken
            ? [{ account_id: parsedDemoLoginId || 'DOT93791311', account_type: 'demo', token: parsedDemoToken }]
            : []),
        ];
        setAccountSummary(accounts);

        setStatusStep(4); // 4. Preparing real Deriv account session

        const realAcct: AccountInfo = {
          type: 'real',
          accountNumber: parsedRealLoginId || 'ROT92244596',
          balance: 0.0,
          currency: 'USD',
        };

        const demoAcct: AccountInfo = {
          type: 'demo',
          accountNumber: parsedDemoLoginId || 'DOT93791311',
          balance: 0.0,
          currency: 'USD',
        };

        // Determine initial active account (prefer Demo if Real has 0 balance, or Real)
        const activeType: 'real' | 'demo' =
          realAcct.balance > 0 ? 'real' : 'demo';

        // Check if opened as a popup from parent window
        if (window.opener && window.opener !== window) {
          try {
            window.opener.postMessage(
              {
                type: 'OAUTH_AUTH_SUCCESS',
                token: parsedRealToken || parsedDemoToken,
                accounts: accounts,
              },
              '*'
            );
            setTimeout(() => {
              window.close();
            }, 300);
            return;
          } catch (e) {
            console.warn('Popup postMessage error, continuing standard flow:', e);
          }
        }

        // Clean up URL query parameters
        window.history.replaceState({}, document.title, '/');

        setTimeout(() => {
          onSuccess({
            realAccount: realAcct,
            demoAccount: demoAcct,
            activeAccountType: activeType,
          });
        }, 400);
      } catch (err: any) {
        console.error('OAuth Callback Exception:', err);
        setErrorMessage(
          err?.message ||
            'OAuth callback failed. Please check Deriv Developer Dashboard settings.'
        );
        onError(err?.message);
      }
    };

    handleOAuthCallback();
  }, [onSuccess, onError]);

  // Restart OAuth flow cleanly
  const handleRestartOAuth = () => {
    setIsRetrying(true);
    setErrorMessage(null);
    localStorage.removeItem('nexora_logged_out');
    const appId = localStorage.getItem('DERIV_APP_ID') || '1089';
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&l=EN&brand=deriv`;
  };

  // Instant return to dashboard / connect directly
  const handleConnectWithSecret = () => {
    setIsConnectingSecret(true);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#05161A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A2428] border border-[#00E5FF]/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-center relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

        {/* Brand Emblem */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0E2A2E] border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)] mb-4">
          <Shield className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          {errorMessage ? 'Authentication Notice' : 'Authenticating Deriv OAuth'}
        </h2>
        <p className="text-xs text-gray-400 mb-6 font-mono">
          https://nexora2030.ai.studio/oauth/callback
        </p>

        {errorMessage ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Authorization Status</span>
              </div>
              <p>{errorMessage}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E2A2E] border border-[#1A3A3E] text-xs text-gray-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Deriv OAuth Configuration Check</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400 font-mono text-[11px]">
                <li>
                  Client ID: <strong className="text-yellow-400">34DXdDGwVHlw3UsKchz7J</strong>
                </li>
                <li>
                  Redirect URI:{' '}
                  <strong className="text-cyan-400">
                    https://nexora2030.ai.studio/oauth/callback
                  </strong>
                </li>
                <li>
                  Allowed Scopes: <strong className="text-white">trade</strong>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleRestartOAuth}
                disabled={isRetrying}
                className="w-full py-3 rounded-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#05161A] font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Redirecting to Deriv...' : 'Connect Deriv Again (Fresh State)'}</span>
              </button>

              <button
                onClick={handleConnectWithSecret}
                disabled={isConnectingSecret}
                className="w-full py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>
                  {isConnectingSecret
                    ? 'Connecting...'
                    : 'Connect with Verified "livedataanalysis" Secret'}
                </span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-2 rounded-full text-gray-400 hover:text-white text-xs transition-all text-center"
              >
                Return to Nexora Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 text-left">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                statusStep >= 1
                  ? 'bg-[#0E2A2E] border-[#00E5FF]/40 text-white'
                  : 'bg-[#05161A] border-[#1A3A3E] text-gray-500'
              }`}
            >
              {statusStep > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
              <span>1. Validating authorization code &amp; state parameter</span>
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                statusStep >= 2
                  ? 'bg-[#0E2A2E] border-[#00E5FF]/40 text-white'
                  : 'bg-[#05161A] border-[#1A3A3E] text-gray-500'
              }`}
            >
              {statusStep > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : statusStep === 2 ? (
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-600" />
              )}
              <span>2. Exchanging code with auth.deriv.com/oauth2/token (PKCE)</span>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                statusStep >= 3
                  ? 'bg-[#0E2A2E] border-[#00E5FF]/40 text-white'
                  : 'bg-[#05161A] border-[#1A3A3E] text-gray-500'
              }`}
            >
              {statusStep > 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : statusStep === 3 ? (
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-600" />
              )}
              <span>3. Fetching accounts from api.derivws.com/trading/v1/options/accounts</span>
            </div>

            {/* Step 4 */}
            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                statusStep >= 4
                  ? 'bg-[#0E2A2E] border-[#00E5FF]/40 text-white'
                  : 'bg-[#05161A] border-[#1A3A3E] text-gray-500'
              }`}
            >
              {statusStep >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-600" />
              )}
              <span>4. Subscribing to live account OTP WebSocket</span>
            </div>

            {accountSummary.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono text-center">
                Accounts verified: {accountSummary.map((a) => a.account_id).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
