import { useState, useEffect, useCallback } from 'react';
import { LogIn, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../../../../ui/badge';
import { Button } from '../../../../../../ui/button';
import SessionProviderLogo from '../../../../../../llm-logo-provider/SessionProviderLogo';
import type { AgentProvider, AuthStatus } from '../../../../../types/types';
import type { ModelOption } from '../../../../../../chat/hooks/useCustomModels';

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

  // Custom models state
  const [customModels, setCustomModels] = useState<ModelOption[]>(() => {
    try {
      const raw = localStorage.getItem('claude-custom-models');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [newModelId, setNewModelId] = useState('');
  const [newModelLabel, setNewModelLabel] = useState('');
  const [newModelBaseUrl, setNewModelBaseUrl] = useState('');
  const [newModelSystemPrompt, setNewModelSystemPrompt] = useState('');
  const [editingModel, setEditingModel] = useState<string | null>(null);

  const saveCustomModels = useCallback((models: ModelOption[]) => {
    setCustomModels(models);
    localStorage.setItem('claude-custom-models', JSON.stringify(models));
  }, []);

  const handleAddCustomModel = useCallback(() => {
    const id = newModelId.trim();
    if (!id) return;
    if (customModels.some((m) => m.value === id)) return;
    const entry: ModelOption = { value: id, label: newModelLabel.trim() || id };
    if (newModelBaseUrl.trim()) entry.baseUrl = newModelBaseUrl.trim();
    if (newModelSystemPrompt.trim()) entry.systemPrompt = newModelSystemPrompt.trim();
    saveCustomModels([...customModels, entry]);
    setNewModelId('');
    setNewModelLabel('');
    setNewModelBaseUrl('');
    setNewModelSystemPrompt('');
  }, [customModels, newModelId, newModelLabel, newModelBaseUrl, newModelSystemPrompt, saveCustomModels]);

  const handleRemoveCustomModel = useCallback((value: string) => {
    saveCustomModels(customModels.filter((m) => m.value !== value));
  }, [customModels, saveCustomModels]);

  const handleUpdateCustomModel = useCallback((value: string, updates: Partial<ModelOption>) => {
    saveCustomModels(customModels.map((m) => m.value === value ? { ...m, ...updates } : m));
  }, [customModels, saveCustomModels]);

  // Sync custom models when localStorage changes from another component
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('claude-custom-models');
        setCustomModels(raw ? JSON.parse(raw) : []);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

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
              <div className="border-t border-orange-200 dark:border-orange-700 pt-4 space-y-3">
                <div>
                  <div className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                    Custom Models
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                    Add models with per-model base URLs and system prompts. These appear in the chat model selector.
                  </p>

                  {/* Existing custom models list */}
                  {customModels.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {customModels.map((m) => (
                        <div key={m.value} className="border border-orange-200 dark:border-orange-700 rounded-md p-2 bg-white/50 dark:bg-gray-800/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-orange-900 dark:text-orange-100 truncate">{m.label}</span>
                                {m.baseUrl && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                    custom URL
                                  </Badge>
                                )}
                                {m.systemPrompt && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                    system prompt
                                  </Badge>
                                )}
                              </div>
                              {m.label !== m.value && (
                                <span className="text-xs text-orange-600/70 dark:text-orange-400/70 truncate block">{m.value}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setEditingModel(editingModel === m.value ? null : m.value)}
                                className="p-1 rounded text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                title="Edit model"
                                type="button"
                              >
                                {editingModel === m.value ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleRemoveCustomModel(m.value)}
                                className="p-1 rounded text-orange-600 hover:text-red-600 dark:text-orange-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Remove model"
                                type="button"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Inline edit panel */}
                          {editingModel === m.value && (
                            <div className="mt-2 pt-2 border-t border-orange-200/50 dark:border-orange-700/50 space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-orange-800 dark:text-orange-200 mb-0.5">Display Name</label>
                                <input
                                  type="text"
                                  value={m.label}
                                  onChange={(e) => handleUpdateCustomModel(m.value, { label: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-orange-800 dark:text-orange-200 mb-0.5">Base URL</label>
                                <input
                                  type="text"
                                  value={m.baseUrl || ''}
                                  onChange={(e) => handleUpdateCustomModel(m.value, { baseUrl: e.target.value || undefined })}
                                  placeholder="Uses global Ollama URL if empty"
                                  className="w-full px-2 py-1 text-xs border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-orange-800 dark:text-orange-200 mb-0.5">System Prompt</label>
                                <textarea
                                  value={m.systemPrompt || ''}
                                  onChange={(e) => handleUpdateCustomModel(m.value, { systemPrompt: e.target.value || undefined })}
                                  placeholder="Optional system prompt for this model"
                                  rows={3}
                                  className="w-full px-2 py-1 text-xs border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new model form */}
                  <div className="border border-dashed border-orange-300 dark:border-orange-700 rounded-md p-3 space-y-2">
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-200">Add Model</p>
                    <input
                      type="text"
                      value={newModelId}
                      onChange={(e) => setNewModelId(e.target.value)}
                      placeholder="Model ID (required, e.g. llama3.2:latest)"
                      className="w-full px-2 py-1.5 text-sm border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      value={newModelLabel}
                      onChange={(e) => setNewModelLabel(e.target.value)}
                      placeholder="Display name (optional)"
                      className="w-full px-2 py-1.5 text-sm border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      value={newModelBaseUrl}
                      onChange={(e) => setNewModelBaseUrl(e.target.value)}
                      placeholder="Base URL (optional, e.g. http://host:11434)"
                      className="w-full px-2 py-1.5 text-sm border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <textarea
                      value={newModelSystemPrompt}
                      onChange={(e) => setNewModelSystemPrompt(e.target.value)}
                      placeholder="System prompt (optional)"
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
                    />
                    <button
                      onClick={handleAddCustomModel}
                      disabled={!newModelId.trim()}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Model
                    </button>
                  </div>
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
