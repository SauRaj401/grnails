import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  createBooking,
  formatBookingCount,
  listenToBookings,
  removeBooking,
  type BookingRecord,
  updateBooking,
} from "@/lib/bookings";
import { firebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Booking = BookingRecord & { id: string };

function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (!ready) return undefined;
    return listenToBookings((next) => {
      setBookings(next as Booking[]);
      setSelectedId((current) => current ?? next[0]?.id ?? null);
    });
  }, [ready]);

  const selected = useMemo(
    () => bookings.find((booking) => booking.id === selectedId) ?? null,
    [bookings, selectedId],
  );
  const selectedIndex = useMemo(
    () => bookings.findIndex((booking) => booking.id === selectedId),
    [bookings, selectedId],
  );

  const setStatus = async (id: string, status: BookingRecord["status"]) => {
    setSavingId(id);
    try {
      await updateBooking(id, { status });
    } finally {
      setSavingId(null);
    }
  };

  const setNotes = async (id: string, notes: string) => {
    setSavingId(id);
    try {
      await updateBooking(id, { notes });
    } finally {
      setSavingId(null);
    }
  };

  const deleteCurrent = async (id: string) => {
    await removeBooking(id);
    if (selectedId === id) {
      setSelectedId(bookings.find((booking) => booking.id !== id)?.id ?? null);
    }
  };

  useEffect(() => {
    setNotesDraft(selected?.notes || "");
  }, [selected?.id, selected?.notes]);

  const logout = async () => {
    await signOut(firebaseAuth);
    navigate({ to: "/", replace: true });
  };

  const createDemo = async () => {
    setCreating(true);
    try {
      const now = new Date().toISOString();
      const demo = await createBooking({
        reference: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        name: "Test Client",
        phone: "+61 400 000 000",
        email: "test@example.com",
        date: now,
        time: "10:00 AM",
        services: [{ id: "mani-basic", name: "Basic Manicure", qty: 1, price: 20 }],
        total: 20,
        paymentRef: "DEMO",
        notes: "Created from the admin dashboard.",
      });
      setSelectedId(demo.id);
    } finally {
      setCreating(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatBookingCount(bookings.length)} synced from Firestore.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={createDemo}
              disabled={creating}
              className="px-3 py-2 bg-foreground text-background text-xs uppercase tracking-[0.25em] disabled:opacity-60"
            >
              {creating ? "Creating..." : "New demo booking"}
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 border border-border text-xs uppercase tracking-[0.25em]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="bg-[var(--cream)] border border-border p-4 rounded-sm">
            <h2 className="text-lg font-semibold mb-3">Bookings</h2>
            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {bookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedId(booking.id)}
                  className={`w-full text-left p-3 border rounded-sm transition-colors ${
                    selectedId === booking.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background border-border hover:border-[var(--rose)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{booking.name}</div>
                      <div className="text-xs opacity-75">
                        {booking.reference} · {booking.time || "-"}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] opacity-75">
                      {booking.status}
                    </span>
                  </div>
                </button>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              )}
            </div>
          </aside>

          <section className="bg-background border border-border p-5 rounded-sm">
            {selected ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selected.reference} · {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (selectedIndex > 0) {
                          setSelectedId(bookings[selectedIndex - 1]?.id ?? null);
                        }
                      }}
                      className="px-3 py-2 border border-border text-xs uppercase tracking-[0.25em]"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => {
                        if (selectedIndex >= 0 && selectedIndex < bookings.length - 1) {
                          setSelectedId(bookings[selectedIndex + 1]?.id ?? null);
                        }
                      }}
                      className="px-3 py-2 border border-border text-xs uppercase tracking-[0.25em]"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => deleteCurrent(selected.id)}
                      className="px-3 py-2 border border-destructive text-xs uppercase tracking-[0.25em] text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phone</p>
                    <p className="mt-1 font-medium">{selected.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Email</p>
                    <p className="mt-1 font-medium">{selected.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">When</p>
                    <p className="mt-1 font-medium">
                      {selected.date ? new Date(selected.date).toLocaleDateString() : "-"} {selected.time || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</p>
                    <p className="mt-1 font-medium">${selected.total}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Status</p>
                  <select
                    value={selected.status}
                    onChange={(e) => setStatus(selected.id, e.target.value as BookingRecord["status"])}
                    disabled={savingId === selected.id}
                    className="mt-2 w-full sm:w-64 border border-border px-3 py-2 bg-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Services</p>
                  <ul className="mt-2 space-y-1">
                    {selected.services.map((service) => (
                      <li key={service.id} className="text-sm">
                        {service.name} ×{service.qty} — ${service.price * service.qty}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Notes</p>
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    onBlur={() => setNotes(selected.id, notesDraft)}
                    rows={4}
                    className="mt-2 w-full border border-border bg-background px-3 py-2 resize-none"
                    placeholder="Optional internal notes..."
                  />
                </div>

                {selected.screenshotUrl && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment screenshot</p>
                    <img
                      src={selected.screenshotUrl}
                      alt={selected.screenshotName || "Payment screenshot"}
                      className="mt-2 max-h-80 rounded-sm border border-border object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                Select a booking to view details.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
