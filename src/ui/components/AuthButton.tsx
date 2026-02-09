/**
 * Auth Button
 * Shows "Sign In" when logged out, or truncated email + "Sign Out" when logged in.
 * Placed in the menu header.
 */

import { useAuthStore } from '../stores/auth-store.ts';
import { COLORS, SPACING, RADIUS, TRANSITIONS, TYPOGRAPHY } from '../theme/index.ts';

export function AuthButton() {
  const { user, isInitialized, syncStatus, setShowAuthModal, signOut } = useAuthStore();

  // Don't render until auth is initialized
  if (!isInitialized) return null;

  // Logged in state
  if (user) {
    const email = user.email ?? '';
    const displayEmail = email.length > 20 ? email.slice(0, 17) + '...' : email;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
        {/* Sync status indicator */}
        {syncStatus === 'syncing' && (
          <span style={{ fontSize: TYPOGRAPHY.size.xs, color: COLORS.accent.primary }}>
            Syncing...
          </span>
        )}
        {syncStatus === 'synced' && (
          <span style={{ fontSize: TYPOGRAPHY.size.xs, color: COLORS.success }}>
            Synced
          </span>
        )}

        {/* Email display */}
        <span
          style={{
            fontSize: TYPOGRAPHY.size.sm,
            color: COLORS.text.tertiary,
          }}
        >
          {displayEmail}
        </span>

        {/* Sign out button */}
        <button
          onClick={() => signOut()}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: RADIUS.md,
            color: COLORS.text.tertiary,
            fontSize: TYPOGRAPHY.size.xs,
            padding: `${SPACING.xs}px ${SPACING.sm}px`,
            cursor: 'pointer',
            transition: `all ${TRANSITIONS.fast}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = COLORS.border.medium;
            e.currentTarget.style.color = COLORS.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.border.default;
            e.currentTarget.style.color = COLORS.text.tertiary;
          }}
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
      style={{
        background: 'none',
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: RADIUS.md,
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.size.sm,
        padding: `${SPACING.xs}px ${SPACING.md}px`,
        cursor: 'pointer',
        transition: `all ${TRANSITIONS.fast}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent.primary;
        e.currentTarget.style.color = COLORS.accent.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border.default;
        e.currentTarget.style.color = COLORS.text.secondary;
      }}
    >
      Sign In
    </button>
  );
}
