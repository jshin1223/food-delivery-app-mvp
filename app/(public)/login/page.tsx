// app/(public)/login/page.tsx
'use client';
import { supabase } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login() {
  return (
    <div className="max-w-md mx-auto py-8">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        view="sign_in"
        magicLink
      />
    </div>
  );
}
