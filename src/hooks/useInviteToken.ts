import { useCallback, useEffect, useState } from 'react';

const readTokenFromUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('inviteToken');
};

export const useInviteToken = () => {
  const [inviteToken, setInviteToken] = useState<string | null>(() => readTokenFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setInviteToken(readTokenFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const clearInviteToken = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('inviteToken');
    window.history.replaceState({}, '', url);
    setInviteToken(null);
  }, []);

  return { inviteToken, clearInviteToken };
};
