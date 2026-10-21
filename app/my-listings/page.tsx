
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  listing_type: string;
  price: number;
  created_at: string;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editCategory, setEditCategory] = useState("Books");
const [editPrice, setEditPrice] = useState("");
const [editType, setEditType] = useState("Sell");
const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function loadMyListings() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Please sign in to view your listings.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Unable to load listings: " + error.message);
      } else {
        setListings((data ?? []) as Listing[]);
      }

      setLoading(false);
    }

    loadMyListings();
  }, []);

  
function startEditing(item: Listing) {
  setEditingId(item.id);
  setEditTitle(item.title);
  setEditDescription(item.description);
  setEditCategory(item.category);
  setEditPrice(String(item.price));
  setEditType(item.listing_type);
  setMessage("");
}

async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!editingId || !editTitle.trim() || !editDescription.trim()) {
    setMessage("Please complete the title and description.");
    return;
  }

  const priceNumber = Number(editPrice);

  if (editPrice.trim() === "" || !Number.isFinite(priceNumber) || priceNumber < 0) {
    setMessage("Please enter a valid price.");
    return;
  }

  setSavingEdit(true);
  setMessage("");

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in again.");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        price: priceNumber,
        listing_type: editType,
      })
      .eq("id", editingId)
      .eq("seller_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      setMessage("Listing was not updated. Check your permissions and try again.");
      return;
    }

    setListings((previous) =>
      previous.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: data.title,
              description: data.description,
              category: data.category,
              price: Number(data.price),
              listing_type: data.listing_type,
            }
          : item
      )
    );

    setEditingId(null);
    setMessage("Listing updated successfully!");
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Unable to update listing."
    );
  } finally {
    setSavingEdit(false);
  }
}

async function deleteListing(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this listing? This cannot be undone."
  );

  if (!confirmed) return;

  setMessage("");

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in again.");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("seller_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      setMessage("Listing was not deleted. Check your permissions and try again.");
      return;
    }

    setListings((previous) => previous.filter((item) => item.id !== id));
    setMessage("Listing deleted successfully!");
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Unable to delete listing."
    );
  }
}


  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Back to CampusXchange
        </a>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Listings
        </h1>

{editingId && (
  <form
    onSubmit={saveEdit}
    className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2"
  >
    <h2 className="text-xl font-bold md:col-span-2">
      Edit your listing
    </h2>

    <label className="grid gap-2 text-sm font-semibold">
      Item name
      <input
        required
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="rounded-lg border p-3 font-normal"
      />
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Category
      <select
        value={editCategory}
        onChange={(e) => setEditCategory(e.target.value)}
        className="rounded-lg border p-3 font-normal"
      >
        {["Books", "Electronics", "Hostel Essentials", "Clothing", "Other"].map(
          (category) => (
            <option key={category} value={category}>
              {category}
            </option>
          )
        )}
      </select>
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Description
      <textarea
        required
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
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
        step="0.01"
        value={editPrice}
        onChange={(e) => setEditPrice(e.target.value)}
        className="rounded-lg border p-3 font-normal"
      />
    </label>

    <label className="grid gap-2 text-sm font-semibold">
      Exchange type
      <select
        value={editType}
        onChange={(e) => setEditType(e.target.value)}
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
        disabled={savingEdit}
        className="rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        {savingEdit ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={() => setEditingId(null)}
        className="rounded-lg border px-5 py-3"
      >
        Cancel
      </button>
    </div>
  </form>
)}



        <p className="mt-2 text-gray-600">
          Manage the items you have posted on CampusXchange.
        </p>

        {loading && (
          <p className="mt-8 text-gray-600">Loading your listings...</p>
        )}

        {!loading && message && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            {message}
            <p className="mt-3">
              <a
                href="/login"
                className="font-bold underline"
              >
                Go to Student Login
              </a>
            </p>
          </div>
        )}

        {!loading && !message && listings.length === 0 && (
          <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
            <p className="text-lg font-semibold text-gray-800">
              You haven't posted any items yet.
            </p>
            <p className="mt-2 text-gray-600">
              List your first item to see it here.
            </p>
            <a
              href="/"
              className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              List an Item
            </a>
          </div>
        )}

        {!loading && !message && listings.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {item.category}
                </span>

                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {item.title}
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                  {item.description}
                </p>

                <p className="mt-4 text-2xl font-bold text-indigo-700">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Type: {item.listing_type}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Posted: {new Date(item.created_at).toLocaleDateString("en-IN")}
                  <div className="mt-5 flex gap-3">
  <button
    type="button"
    onClick={() => startEditing(item)}
    className="rounded-lg border border-indigo-600 px-4 py-2 font-semibold text-indigo-600 hover:bg-indigo-50"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => deleteListing(item.id)}
    className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
  >
    Delete
  </button>
</div>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
