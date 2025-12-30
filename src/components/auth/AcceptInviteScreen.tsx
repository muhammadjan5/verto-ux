import { FormEvent, useEffect, useState } from 'react';
import styles from './AuthScreen.module.css';
import { useAuth } from '../../contexts/AuthContext';
import type { InviteDetails } from '../../services/api';

interface AcceptInviteScreenProps {
  token: string;
  onComplete: () => void;
}

export const AcceptInviteScreen = ({ token, onComplete }: AcceptInviteScreenProps) => {
  const { loadInvite, acceptInvite } = useAuth();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');
    setError('');

    loadInvite(token)
      .then((details) => {
        if (!isMounted) {
          return;
        }

        setInvite(details);
        setStatus('ready');
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Invite not found.');
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [loadInvite, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invite) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await acceptInvite(token, password || undefined);
      onComplete();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to accept invite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <h1 className={styles.title}>Accept invite</h1>
        <p className={styles.subtitle}>
          Join an existing project to edit release information alongside your teammates.
        </p>

        {status === 'loading' && <div className={styles.subtitle}>Checking your invite…</div>}

        {status === 'error' && (
          <>
            <div className={styles.error}>{error}</div>
            <button type="button" className="btn btn--filled" onClick={onComplete}>
              Back to sign in
            </button>
          </>
        )}

        {status === 'ready' && invite && (
          <>
            <div className={styles.meta}>
              <p>
                <strong>{invite.inviterEmail || 'A teammate'}</strong> invited you to collaborate on{' '}
                <strong>{invite.projectName}</strong>.
              </p>
              <p>This invite was sent to {invite.email}.</p>
            </div>

            {submitError && <div className={styles.error}>{submitError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="invite-password">
                  Password
                </label>
                <input
                  id="invite-password"
                  type="password"
                  placeholder="Set a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <p className={styles.helper}>
                  Set a password if you are new here. If you already have an account, you can leave this blank.
                </p>
              </div>

              <button type="submit" className={`btn btn--filled ${styles.submitButton}`} disabled={isSubmitting}>
                Join project
              </button>
            </form>

            <div className={styles.toggle}>
              <button type="button" onClick={onComplete}>
                Use a different email
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
