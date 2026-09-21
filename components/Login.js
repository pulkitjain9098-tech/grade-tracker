import { useState } from "react";
import { signIn } from "../lib/firebase";
import { ALLOWED_EMAIL_DOMAIN } from "../lib/config";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signIn();
    } catch (e) {
      setError(e.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p style={{ marginTop: 0 }}>
        Sign in with your <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> Google account to
        view and submit grades.
      </p>
      <button onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
