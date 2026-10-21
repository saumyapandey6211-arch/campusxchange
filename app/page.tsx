
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const categories = ["All Items", "Books", "Electronics", "Hostel Essentials", "Clothing", "Other"];

const initialListings = [
  { id: 1, title: "Engineering Mathematics Book", category: "Books", price: 250, condition: "Good", emoji: "📚", type: "Sell" },
  { id: 2, title: "Study Table Lamp", category: "Hostel Essentials", price: 180, condition: "Like New", emoji: "💡", type: "Sell" },
  { id: 3, title: "Scientific Calculator", category: "Electronics", price: 350, condition: "Good", emoji: "🧮", type: "Rent" },
  { id: 4, title: "College Backpack", category: "Clothing", price: 200, condition: "Good", emoji: "🎒", type: "Swap" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
 const [title, setTitle] = useState("");

 const [description, setDescription] = useState("");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("Books");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("Sell");
  const [listings, setListings] = useState(initialListings);
  useEffect(() => {
  async function loadListings() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading listings:", error.message);
      return;
    }

    if (data) {
      setListings(
        data.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: Number(item.price),
          condition: "Good",
          emoji: "📦",
          type: item.listing_type,
        }))
      );
    }
  }

  loadListings();
}, []);

  const filtered = listings.filter((item) =>
    (selectedCategory === "All Items" || item.category === selectedCategory) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  
async function addListing(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!title.trim() || !description.trim() || price === "" || Number(price) < 0) {
    setNotice("Please fill in all fields correctly.");
    return;
  }

  setSaving(true);
  setNotice("");

  try {
    const supabase = createClient();
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setNotice("Please sign in before listing an item.");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: userData.user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        listing_type: type,
        price: Number(price),
      })
      .select()
      .single();

    if (error) throw error;

    setListings((previous) => [
      {
        id: data.id,
        title: data.title,
        category: data.category,
        price: Number(data.price),
        condition: "Good",
        emoji: "📦",
        type: data.listing_type,
      },
      ...previous.filter((item) => item.id !== data.id),
    ]);

    setTitle("");
    setDescription("");
    setPrice("");
    setShowForm(false);
    setNotice("Your item has been saved successfully!");
  } catch (error) {
    setNotice(
      error instanceof Error
        ? error.message
        : "Unable to save the item. Please try again."
    );
  } finally {
    setSaving(false);
  }
}


  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="#" className="text-2xl font-black tracking-tight text-indigo-700">
            Campus<span className="text-slate-900">Xchange</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#marketplace" className="hover:text-indigo-700">Marketplace</a>
            <a href="#how-it-works" className="hover:text-indigo-700">How it works</a>
            <button onClick={() => setNotice("Notifications will be connected in a later step.")}>
              🔔 Notifications
            </button>
          </nav>
          <a
  href="/login"
  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
>
  Student Login
</a>
<a
  href="/my-listings"
  className="rounded-xl border border-indigo-600 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
>
  My Listings
</a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
              🎓 Made for college students
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Your campus.<br />Your community.<br />
              <span className="text-amber-300">Smarter exchange.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-indigo-100">
              Buy, sell, rent, swap or give away the things students need,
              right within their college community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#marketplace" className="rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 hover:bg-indigo-50">
                Explore Marketplace →
              </a>
              <button onClick={() => setShowForm(true)} className="rounded-xl border border-white/50 px-5 py-3 font-bold hover:bg-white/10">
                + List an Item
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-indigo-100">
              <span>✓ College community</span>
              <span>✓ Affordable finds</span>
              <span>✓ Reuse and exchange</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["📚", "Books", "Learn more, spend less"],
              ["💻", "Electronics", "Tech for student life"],
              ["🛏️", "Hostel essentials", "Make your room yours"],
              ["♻️", "Swap & reuse", "Give things another life"],
            ].map(([emoji, title, subtitle]) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="text-4xl">{emoji}</div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-indigo-100">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Discover</p>
            <h2 className="mt-2 text-3xl font-black">Campus Marketplace</h2>
            <p className="mt-2 text-slate-600">Find useful things from fellow students.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">
            + List an Item
          </button>
        </div>

        {notice && (
          <div role="status" className="mt-5 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss notification" className="ml-4 font-bold">✕</button>
          </div>
        )}
       
{showForm && (
  <form
    onSubmit={addListing}
    className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2"
  >
    <h3 className="text-xl font-bold md:col-span-2">
      List your item
    </h3>

    <label className="grid gap-2 text-sm font-semibold">
      Item name
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Physics textbook"
        className="rounded-lg border p-3 font-normal"
      />
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Category
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border p-3 font-normal"
      >
        {categories
          .filter((c) => c !== "All Items")
          .map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
      </select>
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Description
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your item"
        rows={3}
        className="rounded-lg border p-3 font-normal"
      />
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Price (₹)
      <input
        required
        type="number"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Enter amount"
        className="rounded-lg border p-3 font-normal"
      />
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Exchange type
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-lg border p-3 font-normal"
      >
        <option>Sell</option>
        <option>Rent</option>
        <option>Swap</option>
        <option>Give Away</option>
      </select>
    </label>

    <div className="flex gap-3 md:col-span-2">
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add item"}
      </button>

      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="rounded-lg border px-5 py-3"
      >
        Cancel
      </button>
    </div>
  </form>
)}


        <div className="mt-7">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search books, electronics, hostel items..." className="w-full rounded-xl border bg-white px-4 py-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === c ? "bg-indigo-600 text-white" : "border bg-white text-slate-700 hover:border-indigo-300"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-36 items-center justify-center bg-indigo-50 text-6xl">{item.emoji}</div>
              <div className="p-4">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{item.type}</span>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.category} · {item.condition}</p>
                <p className="mt-4 text-2xl font-black text-indigo-700">{item.price === 0 ? "Free" : `₹${item.price}`}</p>
                <button onClick={() => setNotice(`You selected "${item.title}". Student login and messaging will be added next.`)} className="mt-4 w-full rounded-lg border border-indigo-200 py-2.5 font-bold text-indigo-700 hover:bg-indigo-50">
                  View item
                </button>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <p className="py-12 text-center text-slate-500">No items found. Try another search or category.</p>}
      </section>

      <section id="how-it-works" className="border-y bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Simple and student-friendly</p>
            <h2 className="mt-2 text-3xl font-black">How CampusXchange works</h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Join your campus", "Create a student account and verify your college email."],
              ["02", "Find or list items", "Browse available items or list what you no longer need."],
              ["03", "Connect and exchange", "Arrange an exchange with another student."],
            ].map(([number, title, desc]) => (
              <div key={number} className="rounded-2xl border p-6">
                <p className="text-sm font-black text-indigo-600">{number}</p>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400">
        <p className="text-lg font-black text-white">CampusXchange</p>
        <p className="mt-2">A smarter way to exchange within your campus.</p>
        <p className="mt-4">Student community project · Demo version</p>
      </footer>
    </main>
  );
}
