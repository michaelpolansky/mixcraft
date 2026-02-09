/**
 * Auth Modal
 * Sign up / Sign in overlay with email + password.
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store.ts';
import { COLORS, SPACING, RADIUS, SHADOWS, Z_INDEX, TRANSITIONS, TYPOGRAPHY } from '../theme/index.ts';

type Tab = 'signin' | 'signup' | 'forgot' | 'reset';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, resetPassword, updatePassword, isLoading, pendingPasswordReset } = useAuthStore();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Switch to reset tab when user clicks a password recovery link
  useEffect(() => {
    if (pendingPasswordReset) {
      setTab('reset');
      setError('');
      setSuccess('');
    }
  }, [pendingPasswordReset]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tab === 'forgot') {
      if (!email) {
        setError('Email is required.');
        return;
      }
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Check your email for a password reset link.');
      }
      return;
    }

    if (tab === 'reset') {
      if (!password) {
        setError('Password is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const result = await updatePassword(password);
      if (result.error) {
        setError(result.error);
      } else {
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowAuthModal(false);
      }
      return;
    }

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
    setSuccess('');
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
          {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : tab === 'forgot' ? 'Reset Password' : 'Set New Password'}
        </h2>

        {/* Tabs — only shown for signin/signup */}
        {(tab === 'signin' || tab === 'signup') && (
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
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
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
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email — shown for signin, signup, forgot */}
          {tab !== 'reset' && (
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
          )}

          {/* Password — shown for signin, signup, reset */}
          {tab !== 'forgot' && (
            <div style={{ marginBottom: tab === 'reset' ? SPACING.md : SPACING.lg }}>
              <label
                style={{
                  display: 'block',
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.text.tertiary,
                  marginBottom: SPACING.xs,
                }}
              >
                {tab === 'reset' ? 'New Password' : 'Password'}
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
          )}

          {/* Confirm password — only for reset */}
          {tab === 'reset' && (
            <div style={{ marginBottom: SPACING.lg }}>
              <label
                style={{
                  display: 'block',
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.text.tertiary,
                  marginBottom: SPACING.xs,
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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
          )}

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

          {/* Success message */}
          {success && (
            <div
              style={{
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: `${COLORS.accent.primary}15`,
                border: `1px solid ${COLORS.accent.primary}`,
                borderRadius: RADIUS.md,
                color: COLORS.accent.primary,
                fontSize: TYPOGRAPHY.size.sm,
                marginBottom: SPACING.md,
              }}
            >
              {success}
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
            {isLoading ? 'Loading...' : tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : tab === 'forgot' ? 'Send Reset Link' : 'Update Password'}
          </button>

          {/* Forgot password link — shown on signin tab */}
          {tab === 'signin' && (
            <button
              type="button"
              onClick={() => { setTab('forgot'); setError(''); setSuccess(''); }}
              style={{
                display: 'block',
                width: '100%',
                marginTop: SPACING.md,
                background: 'none',
                border: 'none',
                color: COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.size.sm,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Forgot password?
            </button>
          )}

          {/* Back to sign in — shown on forgot tab */}
          {tab === 'forgot' && (
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}
              style={{
                display: 'block',
                width: '100%',
                marginTop: SPACING.md,
                background: 'none',
                border: 'none',
                color: COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.size.sm,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Back to sign in
            </button>
          )}
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
            : tab === 'signup'
            ? 'Create an account to save your progress to the cloud.'
            : tab === 'forgot'
            ? 'We\'ll send a link to reset your password.'
            : 'Choose a new password for your account.'}
        </p>
      </div>
    </>
  );
}
