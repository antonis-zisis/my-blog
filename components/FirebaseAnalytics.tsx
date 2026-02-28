'use client';

import { useEffect } from 'react';
import { setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { initAnalytics } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function FirebaseAnalytics() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    initAnalytics().then((analytics) => {
      if (!analytics) {
        return;
      }

      setAnalyticsCollectionEnabled(analytics, !isAdmin);
    });
  }, [isAdmin]);

  return null;
}
