import { getMyBoxes, createBox, updateBox, deleteBox } from "./actions";

export default async function RestaurantDashboardPage() {
  const boxes = await getMyBoxes();

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>

      {/* CREATE */}
      <section className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Create Wyzly Box</h2>
        <form action={createBox} className="space-y-3">
          <input name="title" placeholder="Title" required className="w-full p-2 border" />
          <input name="price_cents" type="number" placeholder="Price (cents)" required className="w-full p-2 border" />
          <input name="qty_available" type="number" placeholder="Quantity" required className="w-full p-2 border" />
          <input name="image_url" placeholder="Image URL (optional)" className="w-full p-2 border" />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Create
          </button>
        </form>
      </section>

      {/* LIST + UPDATE + DELETE */}
      <section>
        <h2 className="text-lg font-semibold mb-2">My Boxes</h2>
        <div className="space-y-4">
          {boxes.length === 0 && <p>No boxes created yet.</p>}
          {boxes.map((box: any) => (
            <div key={box.id} className="p-4 border rounded mb-2">
              {/* Update form */}
              <form action={updateBox} className="space-y-2 mb-2">
                <input type="hidden" name="id" value={box.id} />
                <input
                  name="title"
                  defaultValue={box.title}
                  required
                  className="w-full p-2 border"
                />
                <input
                  name="price_cents"
                  type="number"
                  defaultValue={box.price_cents}
                  required
                  className="w-full p-2 border"
                />
                <input
                  name="qty_available"
                  type="number"
                  defaultValue={box.qty_available}
                  required
                  className="w-full p-2 border"
                />
                <input
                  name="image_url"
                  defaultValue={box.image_url || ""}
                  className="w-full p-2 border"
                />
                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">
                  Update
                </button>
              </form>
              {/* Delete form as sibling, NOT nested */}
              <form action={deleteBox}>
                <input type="hidden" name="id" value={box.id} />
                <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded">
                  Delete
                </button>
              </form>
              <div>
                <div className="font-semibold">{box.title}</div>
                <div>
                  {(box.price_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} | Qty: {box.qty_available}
                  {box.qty_available === 0 && (
                    <span className="ml-2 text-red-600">Sold Out</span>
                  )}
                </div>
                {box.image_url && (
                  <img src={box.image_url} alt={box.title} className="w-32 mt-2 rounded" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
