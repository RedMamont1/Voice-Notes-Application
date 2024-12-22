import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthComponent() {
  return (
    <div className="max-w-md mx-auto p-4">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        theme="dark"
      />
    </div>
  )
}
