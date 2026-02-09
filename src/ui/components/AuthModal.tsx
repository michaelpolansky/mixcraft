/**
 * Auth Modal
 * Sign up / Sign in overlay with email + password.
 */

import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store.ts';
import { COLORS, SPACING, RADIUS, SHADOWS, Z_INDEX, TRANSITIONS, TYPOGRAPHY } from '../theme/index.ts';

type Tab = 'signin' | 'signup';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, isLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const action = tab === 'signin' ? signIn : signUp;
    const result = await action(email, password);

    if (result.error) {
      setError(result.error);
    } else {
      setEmail('');
      setPassword('');
      setError('');
      setShowAuthModal(false);
    }
  };

  const handleClose = () => {
    setError('');
    setShowAuthModal(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: Z_INDEX.modalBackdrop,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          background: COLORS.bg.secondary,
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOWS.xl,
          zIndex: Z_INDEX.modal,
          padding: SPACING.xl,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: SPACING.md,
            right: SPACING.md,
            background: 'none',
            border: 'none',
            color: COLORS.text.tertiary,
            cursor: 'pointer',
            fontSize: '20px',
            lineHeight: 1,
            padding: SPACING.xs,
          }}
          aria-label="Close"
        >
          x
        </button>

        {/* Title */}
        <h2
          style={{
            margin: `0 0 ${SPACING.lg}px 0`,
            fontSize: TYPOGRAPHY.size.xl,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.text.primary,
          }}
        >
          {tab === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: SPACING.xs,
            marginBottom: SPACING.lg,
            background: COLORS.bg.primary,
            borderRadius: RADIUS.md,
            padding: 3,
          }}
        >
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: tab === t ? COLORS.bg.tertiary : 'transparent',
                border: 'none',
                borderRadius: RADIUS.sm,
                color: tab === t ? COLORS.text.primary : COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.size.sm,
                fontWeight: TYPOGRAPHY.weight.medium,
                cursor: 'pointer',
                transition: `all ${TRANSITIONS.fast}`,
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: SPACING.md }}>
            <label
              style={{
                display: 'block',
                fontSize: TYPOGRAPHY.size.sm,
                color: COLORS.text.tertiary,
                marginBottom: SPACING.xs,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: '100%',
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: COLORS.bg.primary,
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADIUS.md,
                color: COLORS.text.primary,
                fontSize: TYPOGRAPHY.size.md,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border.default; }}
            />
          </div>

          <div style={{ marginBottom: SPACING.lg }}>
            <label
              style={{
                display: 'block',
                fontSize: TYPOGRAPHY.size.sm,
                color: COLORS.text.tertiary,
                marginBottom: SPACING.xs,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              style={{
                width: '100%',
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: COLORS.bg.primary,
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADIUS.md,
                color: COLORS.text.primary,
                fontSize: TYPOGRAPHY.size.md,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border.default; }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: `${COLORS.danger}15`,
                border: `1px solid ${COLORS.danger}`,
                borderRadius: RADIUS.md,
                color: COLORS.danger,
                fontSize: TYPOGRAPHY.size.sm,
                marginBottom: SPACING.md,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: `${SPACING.md}px`,
              background: isLoading ? COLORS.bg.tertiary : 'linear-gradient(145deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: RADIUS.md,
              color: isLoading ? COLORS.text.tertiary : '#fff',
              fontSize: TYPOGRAPHY.size.md,
              fontWeight: TYPOGRAPHY.weight.semibold,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: `all ${TRANSITIONS.normal}`,
            }}
          >
            {isLoading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Footer text */}
        <p
          style={{
            textAlign: 'center',
            fontSize: TYPOGRAPHY.size.xs,
            color: COLORS.text.disabled,
            marginTop: SPACING.lg,
            marginBottom: 0,
          }}
        >
          {tab === 'signin'
            ? 'Your progress syncs across devices when signed in.'
            : 'Create an account to save your progress to the cloud.'}
        </p>
      </div>
    </>
  );
}
