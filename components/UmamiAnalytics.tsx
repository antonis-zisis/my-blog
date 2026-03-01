'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth-context';

export default function UmamiAnalytics() {
  const { isAdmin } = useAuth();

  useEffect(() => {
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
