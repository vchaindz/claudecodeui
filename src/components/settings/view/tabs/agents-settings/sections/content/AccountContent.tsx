import { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../../../../ui/badge';
import { Button } from '../../../../../../ui/button';
import SessionProviderLogo from '../../../../../../llm-logo-provider/SessionProviderLogo';
import type { AgentProvider, AuthStatus } from '../../../../../types/types';

type AccountContentProps = {
  agent: AgentProvider;
  authStatus: AuthStatus;
  onLogin: () => void;
};

type AgentVisualConfig = {
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  subtextClass: string;
  buttonClass: string;
};

const agentConfig: Record<AgentProvider, AgentVisualConfig> = {
  claude: {
    name: 'Claude',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-900 dark:text-blue-100',
    subtextClass: 'text-blue-700 dark:text-blue-300',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
  },
  cursor: {
    name: 'Cursor',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    borderClass: 'border-purple-200 dark:border-purple-800',
    textClass: 'text-purple-900 dark:text-purple-100',
    subtextClass: 'text-purple-700 dark:text-purple-300',
    buttonClass: 'bg-purple-600 hover:bg-purple-700',
  },
  codex: {
    name: 'Codex',
    bgClass: 'bg-gray-100 dark:bg-gray-800/50',
    borderClass: 'border-gray-300 dark:border-gray-600',
    textClass: 'text-gray-900 dark:text-gray-100',
    subtextClass: 'text-gray-700 dark:text-gray-300',
    buttonClass: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
  },
};

export default function AccountContent({ agent, authStatus, onLogin }: AccountContentProps) {
  const { t } = useTranslation('settings');
  const config = agentConfig[agent];

  const [ollamaEnabled, setOllamaEnabled] = useState(() =>
    localStorage.getItem('ollama-enabled') === 'true'
  );
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(() =>
    localStorage.getItem('ollama-base-url') || 'http://localhost:11434'
  );
  const [ollamaAuthToken, setOllamaAuthToken] = useState(() =>
    localStorage.getItem('ollama-auth-token') || 'ollama'
  );
  const [ollamaThinkingModel, setOllamaThinkingModel] = useState(() =>
    localStorage.getItem('ollama-thinking-model') || ''
  );

  useEffect(() => {
    localStorage.setItem('ollama-enabled', String(ollamaEnabled));
  }, [ollamaEnabled]);

  useEffect(() => {
    localStorage.setItem('ollama-base-url', ollamaBaseUrl);
  }, [ollamaBaseUrl]);

  useEffect(() => {
    localStorage.setItem('ollama-auth-token', ollamaAuthToken);
  }, [ollamaAuthToken]);

  useEffect(() => {
    localStorage.setItem('ollama-thinking-model', ollamaThinkingModel);
  }, [ollamaThinkingModel]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <SessionProviderLogo provider={agent} className="w-6 h-6" />
        <div>
          <h3 className="text-lg font-medium text-foreground">{config.name}</h3>
          <p className="text-sm text-muted-foreground">{t(`agents.account.${agent}.description`)}</p>
        </div>
      </div>

      <div className={`${config.bgClass} border ${config.borderClass} rounded-lg p-4`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className={`font-medium ${config.textClass}`}>
                {t('agents.connectionStatus')}
              </div>
              <div className={`text-sm ${config.subtextClass}`}>
                {authStatus.loading ? (
                  t('agents.authStatus.checkingAuth')
                ) : authStatus.authenticated ? (
                  t('agents.authStatus.loggedInAs', {
                    email: authStatus.email || t('agents.authStatus.authenticatedUser'),
                  })
                ) : (
                  t('agents.authStatus.notConnected')
                )}
              </div>
            </div>
            <div>
              {authStatus.loading ? (
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                  {t('agents.authStatus.checking')}
                </Badge>
              ) : authStatus.authenticated ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {t('agents.authStatus.connected')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {t('agents.authStatus.disconnected')}
                </Badge>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${config.textClass}`}>
                  {authStatus.authenticated ? t('agents.login.reAuthenticate') : t('agents.login.title')}
                </div>
                <div className={`text-sm ${config.subtextClass}`}>
                  {authStatus.authenticated
                    ? t('agents.login.reAuthDescription')
                    : t('agents.login.description', { agent: config.name })}
                </div>
              </div>
              <Button
                onClick={onLogin}
                className={`${config.buttonClass} text-white`}
                size="sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {authStatus.authenticated ? t('agents.login.reLoginButton') : t('agents.login.button')}
              </Button>
            </div>
          </div>

          {authStatus.error && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-red-600 dark:text-red-400">
                {t('agents.error', { error: authStatus.error })}
              </div>
            </div>
          )}
        </div>
      </div>

      {agent === 'claude' && (
        <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-orange-900 dark:text-orange-100">
                  Ollama / Custom Backend
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Route requests through a local Ollama instance or any OpenAI-compatible endpoint
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ollamaEnabled}
                  onChange={(e) => setOllamaEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-orange-500" />
              </label>
            </div>

            {ollamaEnabled && (
              <div className="border-t border-orange-200 dark:border-orange-700 pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={ollamaBaseUrl}
                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 text-sm border border-orange-300 dark:border-orange-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Auth Token
                  </label>
                  <input
                    type="text"
                    value={ollamaAuthToken}
                    onChange={(e) => setOllamaAuthToken(e.target.value)}
                    placeholder="ollama"
                    className="w-full px-3 py-2 text-sm border border-orange-300 dark:border-orange-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    Sets ANTHROPIC_AUTH_TOKEN. Use "ollama" for local Ollama or your API key for other backends.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Thinking Model Override
                  </label>
                  <input
                    type="text"
                    value={ollamaThinkingModel}
                    onChange={(e) => setOllamaThinkingModel(e.target.value)}
                    placeholder="e.g. qwen3-coder-next:q4_K_M"
                    className="w-full px-3 py-2 text-sm border border-orange-300 dark:border-orange-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    Use a larger model when thinking mode is active. Leave empty to always use the selected model.
                  </p>
                </div>
              </div>
            )}

            {ollamaEnabled && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  Active
                </Badge>
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  Requests will be sent to {ollamaBaseUrl}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
