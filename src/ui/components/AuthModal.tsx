/**
 * Auth Modal
 * Sign up / Sign in overlay with email + password.
 */

import { useState, useEffect } from 'react';
import { cn } from '../utils/cn.ts';
import { useAuthStore } from '../stores/auth-store.ts';

type Tab = 'signin' | 'signup' | 'forgot' | 'reset';

function getTitle(tab: Tab): string {
  switch (tab) {
    case 'signin': return 'Sign In';
    case 'signup': return 'Create Account';
    case 'forgot': return 'Reset Password';
    case 'reset': return 'Set New Password';
  }
}

function getSubmitLabel(tab: Tab, isLoading: boolean): string {
  if (isLoading) return 'Loading...';
  switch (tab) {
    case 'signin': return 'Sign In';
    case 'signup': return 'Create Account';
    case 'forgot': return 'Send Reset Link';
    case 'reset': return 'Update Password';
  }
}

function getFooterText(tab: Tab): string {
  switch (tab) {
    case 'signin': return 'Your progress syncs across devices when signed in.';
    case 'signup': return 'Create an account to save your progress to the cloud.';
    case 'forgot': return "We'll send a link to reset your password.";
    case 'reset': return 'Choose a new password for your account.';
  }
}

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

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setSuccess('');
  };

  const inputClassName = "w-full py-2 px-3 bg-bg-primary border border-border-default rounded-lg text-text-primary text-md outline-none box-border focus:border-success";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/70 z-[40]"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] max-w-[calc(100vw-32px)] bg-bg-secondary border border-border-default rounded-xl shadow-xl z-[50] p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-transparent border-none text-text-tertiary cursor-pointer text-xl leading-none p-1 hover:text-text-primary"
          aria-label="Close"
        >
          x
        </button>

        {/* Title */}
        <h2 className="m-0 mb-4 text-xl font-semibold text-text-primary">
          {getTitle(tab)}
        </h2>

        {/* Tabs -- only shown for signin/signup */}
        {(tab === 'signin' || tab === 'signup') && (
          <div className="flex gap-1 mb-4 bg-bg-primary rounded-lg p-[3px]">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  'flex-1 py-2 px-3 border-none rounded-sm text-sm font-medium cursor-pointer transition-all duration-100',
                  tab === t
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'bg-transparent text-text-tertiary'
                )}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email -- shown for signin, signup, forgot */}
          {tab !== 'reset' && (
            <div className="mb-3">
              <label className="block text-sm text-text-tertiary mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClassName}
              />
            </div>
          )}

          {/* Password -- shown for signin, signup, reset */}
          {tab !== 'forgot' && (
            <div className={tab === 'reset' ? 'mb-3' : 'mb-4'}>
              <label className="block text-sm text-text-tertiary mb-1">
                {tab === 'reset' ? 'New Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                className={inputClassName}
              />
            </div>
          )}

          {/* Confirm password -- only for reset */}
          {tab === 'reset' && (
            <div className="mb-4">
              <label className="block text-sm text-text-tertiary mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClassName}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="py-2 px-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm mb-3">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="py-2 px-3 bg-success/10 border border-success rounded-lg text-success text-sm mb-3">
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 border-none rounded-lg text-md font-semibold cursor-pointer transition-all duration-200',
              isLoading
                ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                : 'bg-gradient-to-br from-success to-[#16a34a] text-white'
            )}
          >
            {getSubmitLabel(tab, isLoading)}
          </button>

          {/* Forgot password link -- shown on signin tab */}
          {tab === 'signin' && (
            <button
              type="button"
              onClick={() => switchTab('forgot')}
              className="block w-full mt-3 bg-transparent border-none text-text-tertiary text-sm cursor-pointer text-center hover:text-text-secondary"
            >
              Forgot password?
            </button>
          )}

          {/* Back to sign in -- shown on forgot tab */}
          {tab === 'forgot' && (
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className="block w-full mt-3 bg-transparent border-none text-text-tertiary text-sm cursor-pointer text-center hover:text-text-secondary"
            >
              Back to sign in
            </button>
          )}
        </form>

        {/* Footer text */}
        <p className="text-center text-xs text-text-disabled mt-4 mb-0">
          {getFooterText(tab)}
        </p>
      </div>
    </>
  );
}
