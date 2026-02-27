import { useCallback, useEffect, useState } from 'react';
import { CLAUDE_MODELS, CURSOR_MODELS, CODEX_MODELS } from '../../../../shared/modelConstants';
import type { SessionProvider } from '../../../types/app';

export interface ModelOption {
  value: string;
  label: string;
}

const STORAGE_KEYS: Record<SessionProvider, string> = {
  claude: 'claude-custom-models',
  cursor: 'cursor-custom-models',
  codex: 'codex-custom-models',
};

function getDefaults(provider: SessionProvider): ModelOption[] {
  if (provider === 'claude') return CLAUDE_MODELS.OPTIONS;
  if (provider === 'codex') return CODEX_MODELS.OPTIONS;
  return CURSOR_MODELS.OPTIONS;
}

function getDefaultModelValue(provider: SessionProvider): string {
  if (provider === 'claude') return CLAUDE_MODELS.DEFAULT;
  if (provider === 'codex') return CODEX_MODELS.DEFAULT;
  return CURSOR_MODELS.DEFAULT;
}

function loadCustomModels(provider: SessionProvider): ModelOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[provider]);
    if (!raw) return [];
    return JSON.parse(raw) as ModelOption[];
  } catch {
    return [];
  }
}

function saveCustomModels(provider: SessionProvider, models: ModelOption[]) {
  localStorage.setItem(STORAGE_KEYS[provider], JSON.stringify(models));
}

export function useCustomModels(provider: SessionProvider) {
  const [customModels, setCustomModels] = useState<ModelOption[]>(() =>
    loadCustomModels(provider)
  );

  useEffect(() => {
    setCustomModels(loadCustomModels(provider));
  }, [provider]);

  const defaults = getDefaults(provider);
  const defaultValues = new Set(defaults.map((m) => m.value));

  // Defaults first, then custom (deduplicated)
  const allModels: ModelOption[] = [
    ...defaults,
    ...customModels.filter((m) => !defaultValues.has(m.value)),
  ];

  const addModel = useCallback(
    (value: string, label?: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;
      // Don't add duplicates
      if (allModels.some((m) => m.value === trimmedValue)) return;
      const next = [...customModels, { value: trimmedValue, label: (label?.trim() || trimmedValue) }];
      setCustomModels(next);
      saveCustomModels(provider, next);
    },
    [provider, customModels, allModels]
  );

  const removeModel = useCallback(
    (value: string) => {
      const next = customModels.filter((m) => m.value !== value);
      setCustomModels(next);
      saveCustomModels(provider, next);
    },
    [provider, customModels]
  );

  const isCustom = useCallback(
    (value: string) => customModels.some((m) => m.value === value),
    [customModels]
  );

  const defaultModel = getDefaultModelValue(provider);

  return { allModels, addModel, removeModel, isCustom, defaultModel };
}
