/**
 * Auth Button
 * Shows "Sign In" when logged out, or truncated email + "Sign Out" when logged in.
 * Placed in the menu header.
 */

import { useAuthStore } from '../stores/auth-store.ts';

export function AuthButton() {
  const { user, isInitialized, syncStatus, setShowAuthModal, signOut } = useAuthStore();

  // Don't render until auth is initialized
  if (!isInitialized) return null;

  // Logged in state
  if (user) {
    const email = user.email ?? '';
    const displayEmail = email.length > 20 ? email.slice(0, 17) + '...' : email;

    return (
      <div className="flex items-center gap-2">
        {/* Sync status indicator */}
        {syncStatus === 'syncing' && (
          <span className="text-xs text-accent-primary">Syncing...</span>
        )}
        {syncStatus === 'synced' && (
          <span className="text-xs text-success">Synced</span>
        )}

        {/* Email display */}
        <span className="text-sm text-text-tertiary">{displayEmail}</span>

        {/* Sign out button */}
        <button
          onClick={() => signOut()}
          className="bg-transparent border border-border-default rounded-md text-text-tertiary text-xs py-1 px-2 cursor-pointer transition-all duration-100 hover:border-border-medium hover:text-text-secondary"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Logged out state
  return (
    <button
      onClick={() => setShowAuthModal(true)}
      className="bg-transparent border border-border-default rounded-md text-text-secondary text-sm py-1 px-3 cursor-pointer transition-all duration-100 hover:border-accent-primary hover:text-accent-primary"
    >
      Sign In
    </button>
  );
}
