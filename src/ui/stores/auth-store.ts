/**
 * Auth State Management
 * Handles Supabase authentication and cloud progress sync orchestration.
 * NOT persisted — Supabase manages session persistence internally.
 */

import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../core/supabase.ts';
import { mergeProgress, getAllLocalProgress, writeProgressToStores } from '../../core/progress-sync.ts';
import { getTRPC } from '../api/trpc.ts';
import type { ChallengeProgress } from '../../core/types.ts';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  syncStatus: SyncStatus;
  showAuthModal: boolean;
  pendingPasswordReset: boolean;

  // Actions
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  setShowAuthModal: (show: boolean) => void;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;

  // Sync
  syncProgress: () => Promise<void>;
  pushChallengeProgress: (id: string, progress: ChallengeProgress) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  syncStatus: 'idle',
  showAuthModal: false,
  pendingPasswordReset: false,

  initialize: () => {
    getSupabaseClient().then(supabase => {
      if (!supabase) {
        set({ isLoading: false, isInitialized: true });
        return;
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        const prevUser = get().user;
        set({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isInitialized: true,
        });

        // Handle password recovery link click
        if (event === 'PASSWORD_RECOVERY') {
          set({ pendingPasswordReset: true, showAuthModal: true });
          return;
        }

        // Sync on sign-in (when transitioning from no user to user)
        if (session?.user && !prevUser) {
          get().syncProgress();
        }
      });

      // Check existing session
      supabase.auth.getSession().then(({ data }) => {
        set({
          user: data.session?.user ?? null,
          session: data.session,
          isLoading: false,
          isInitialized: true,
        });

        // Sync if already signed in
        if (data.session?.user) {
          get().syncProgress();
        }
      });
    });
  },

  signIn: async (email, password) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return { error: 'Auth not configured' };

    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    // onAuthStateChange will handle setting user and triggering sync
    return {};
  },

  signUp: async (email, password) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return { error: 'Auth not configured' };

    set({ isLoading: true });

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    // onAuthStateChange will handle setting user and triggering sync
    return {};
  },

  signOut: async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    set({ user: null, session: null, syncStatus: 'idle' });
  },

  setShowAuthModal: (show) => {
    set({ showAuthModal: show });
  },

  resetPassword: async (email) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return { error: 'Auth not configured' };

    set({ isLoading: true });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    return {};
  },

  updatePassword: async (newPassword) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return { error: 'Auth not configured' };

    set({ isLoading: true });

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    set({ pendingPasswordReset: false });
    return {};
  },

  syncProgress: async () => {
    const { session } = get();
    if (!session) return;

    set({ syncStatus: 'syncing' });

    try {
      const trpc = await getTRPC();

      // 1. Pull cloud progress
      const cloudProgress = await trpc.progress.getAll.query();

      // 2. Get local progress from all stores
      const localProgress = getAllLocalProgress();

      // 3. Merge (best wins)
      const merged = mergeProgress(localProgress, cloudProgress);

      // 4. Write merged progress back to local stores
      writeProgressToStores(merged);

      // 5. Push merged progress to cloud
      const progressArray = Object.values(merged);
      if (progressArray.length > 0) {
        await trpc.progress.bulkUpsert.mutate(progressArray);
      }

      set({ syncStatus: 'synced' });
    } catch (error) {
      console.error('Progress sync failed:', error);
      set({ syncStatus: 'error' });
    }
  },

  pushChallengeProgress: (id, progress) => {
    const { session } = get();
    if (!session) return;

    // Fire-and-forget — don't block the UI
    getTRPC().then(trpc => {
      trpc.progress.upsert.mutate(progress).catch((error) => {
        console.error(`Failed to push progress for ${id}:`, error);
      });
    });
  },
}));
