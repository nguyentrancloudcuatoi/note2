import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type Note = {
  id: number;
  title: string;
  body?: string;
  isLocal?: boolean;
};

type RemoteNote = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type NotesState = {
  notes: Note[];
  loading: boolean;
  error: string | null;
};

type NotesContextValue = NotesState & {
  addNote: (title: string, body?: string) => void;
  updateNote: (id: number, updates: { title?: string; body?: string }) => void;
  removeNote: (id: number) => void;
  refreshFromApi: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

const STORAGE_KEY = 'notes:v1';

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NotesState>({ notes: [], loading: false, error: null });
  const hasHydrated = useRef(false);

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Note[] = JSON.parse(raw);
          setState((s) => ({ ...s, notes: parsed }));
        }
      } catch (e) {
        // ignore
      } finally {
        hasHydrated.current = true;
      }
    };
    hydrate();
  }, []);

  // Persist on changes after hydration
  useEffect(() => {
    if (!hasHydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes)).catch(() => {});
  }, [state.notes]);

  const addNote = useCallback((title: string, body?: string) => {
    const newNote: Note = { id: Date.now(), title: title.trim(), body: body ?? '', isLocal: true };
    setState((s) => ({ ...s, notes: [newNote, ...s.notes] }));
  }, []);

  const updateNote = useCallback((id: number, updates: { title?: string; body?: string }) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const removeNote = useCallback((id: number) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const refreshFromApi = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data: RemoteNote[] = await response.json();
      const remoteNotes: Note[] = data.slice(0, 20).map((n) => ({ id: n.id, title: n.title, body: n.body }));
      // Keep local notes on top
      setState((s) => ({ ...s, notes: [...s.notes.filter((n) => n.isLocal), ...remoteNotes] }));
    } catch (err: unknown) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const clearAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState((s) => ({ ...s, notes: [] }));
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({ ...state, addNote, updateNote, removeNote, refreshFromApi, clearAll }),
    [state, addNote, updateNote, removeNote, refreshFromApi, clearAll]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}


