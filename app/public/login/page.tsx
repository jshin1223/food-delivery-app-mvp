// app/public/login/page.tsx
import { login } from "../actions";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <form action={login} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Sign in
        </button>
      </form>

      <p className="text-sm text-gray-500">
        Tip: Create users in Supabase Auth. Assign roles in <code>public.profiles.roles</code>.
      </p>
    </div>
  );
}
