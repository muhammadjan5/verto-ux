import { FormEvent, useState } from 'react';
import styles from './InviteUserForm.module.css';

interface InviteUserFormProps {
  client: string;
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

export const InviteUserForm = ({ client, onSubmit, onCancel }: InviteUserFormProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await onSubmit(email);
      setSuccessMessage('Invite sent successfully.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send invite. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.description}>
        Share <strong>{client}</strong> with another teammate. We&apos;ll email them a secure link to join this project.
      </p>

      <label className={styles.label} htmlFor="invite-email">
        Collaborator email
      </label>
      <input
        id="invite-email"
        type="email"
        placeholder="teammate@company.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError('');
          setSuccessMessage('');
        }}
      />

      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <div className={styles.actions}>
        <button type="submit" className="btn btn--filled" disabled={isSubmitting}>
          Send invite
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Close
        </button>
      </div>
    </form>
  );
};
