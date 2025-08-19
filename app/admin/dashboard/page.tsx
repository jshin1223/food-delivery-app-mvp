import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await supabaseServer();

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at, roles")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Admin · Dashboard</h1>
        <div className="text-red-600">Failed to load profiles: {error.message}</div>
      </main>
    );
  }

  // Separate customers and restaurants (could have both roles!)
  const customers = profiles?.filter(
    (p) => Array.isArray(p.roles) && p.roles.includes("customer")
  ) ?? [];
  const restaurants = profiles?.filter(
    (p) => Array.isArray(p.roles) && p.roles.includes("restaurant")
  ) ?? [];

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold mb-6">Admin · Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Customers</h2>
        {!customers.length ? (
          <p>No customer profiles found.</p>
        ) : (
          <ul className="space-y-3">
            {customers.map((p) => (
              <li key={p.id} className="border rounded p-4">
                <div className="font-semibold">{p.full_name || "No Name"}</div>
                <div className="text-xs opacity-70">User ID: <span className="font-mono">{p.id}</span></div>
                <div className="text-xs">Joined: {new Date(p.created_at).toLocaleDateString()}</div>
                <div className="text-xs">Roles: {(p.roles || []).join(", ")}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Restaurants</h2>
        {!restaurants.length ? (
          <p>No restaurant profiles found.</p>
        ) : (
          <ul className="space-y-3">
            {restaurants.map((p) => (
              <li key={p.id} className="border rounded p-4">
                <div className="font-semibold">{p.full_name || "No Name"}</div>
                <div className="text-xs opacity-70">User ID: <span className="font-mono">{p.id}</span></div>
                <div className="text-xs">Joined: {new Date(p.created_at).toLocaleDateString()}</div>
                <div className="text-xs">Roles: {(p.roles || []).join(", ")}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
