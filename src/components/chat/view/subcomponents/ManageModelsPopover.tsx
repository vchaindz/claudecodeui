import React, { useEffect, useRef, useState } from 'react';
import { Settings, X, Plus } from 'lucide-react';
import type { ModelOption } from '../../hooks/useCustomModels';

interface ManageModelsPopoverProps {
  allModels: ModelOption[];
  addModel: (value: string, label?: string) => void;
  removeModel: (value: string) => void;
  isCustom: (value: string) => boolean;
}

export default function ManageModelsPopover({
  allModels,
  addModel,
  removeModel,
  isCustom,
}: ManageModelsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAdd = () => {
    const trimmed = newId.trim();
    if (!trimmed) return;
    addModel(trimmed, newLabel.trim() || undefined);
    setNewId('');
    setNewLabel('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title="Manage models"
        type="button"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 w-72 bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs font-medium text-foreground mb-2">Manage Models</p>

          {/* Model list */}
          <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
            {allModels.map((m) => (
              <div
                key={m.value}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-foreground truncate block">{m.label}</span>
                  {m.label !== m.value && (
                    <span className="text-muted-foreground truncate block text-[10px]">{m.value}</span>
                  )}
                </div>
                {isCustom(m.value) ? (
                  <button
                    onClick={() => removeModel(m.value)}
                    className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove model"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] text-muted-foreground/60">built-in</span>
                )}
              </div>
            ))}
          </div>

          {/* Add new model */}
          <div className="border-t border-border pt-2 space-y-1.5">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Model ID (required)"
              className="w-full px-2 py-1 text-xs bg-muted/50 border border-border/60 rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Display name (optional)"
              className="w-full px-2 py-1 text-xs bg-muted/50 border border-border/60 rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              onClick={handleAdd}
              disabled={!newId.trim()}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              <Plus className="w-3 h-3" />
              Add Model
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
