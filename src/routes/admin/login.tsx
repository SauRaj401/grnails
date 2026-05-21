import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

const ADMIN_EMAIL = "admin@grn.local";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        navigate({ to: "/admin/dashboard", replace: true });
      }
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (authError) {
      setError(
        `Firebase sign-in failed for ${ADMIN_EMAIL}. Make sure the user exists in Firebase Authentication.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-[var(--cream)] border border-border p-6 rounded"
      >
        <h2 className="font-serif text-2xl mb-4">Admin login</h2>
        <label className="block text-xs uppercase text-muted-foreground">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-border"
          type="email"
          required
        />
        <label className="block text-xs uppercase text-muted-foreground">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-border"
          type="password"
          required
        />
        {error && <p className="text-destructive text-sm mb-2">{error}</p>}
        <p className="text-xs text-muted-foreground mb-4">
          Use Firebase Authentication email/password. Create the admin user in the Firebase console
          first.
        </p>
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 bg-foreground text-background disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
