'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) router.replace('/login?error=auth');
      else router.replace('/');
    })();
    // Do not include router or supabase in deps since they're stable
  }, []);

  return <main className="p-6">Signing you in…</main>;
}
