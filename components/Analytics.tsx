'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { initAnalytics } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function Analytics() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    initAnalytics().then((analytics) => {
      if (!analytics) {
        return;
      }
      setAnalyticsCollectionEnabled(analytics, !isAdmin);
    });

    if (isAdmin) {
      localStorage.setItem('umami.disabled', '1');
    }
  }, [isAdmin]);

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
