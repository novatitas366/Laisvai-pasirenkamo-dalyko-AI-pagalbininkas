// Register page - form, validation
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PASSWORD_REQUIREMENTS = [
  { label: "8–12 simbolių", test: (p) => p.length >= 8 && p.length <= 12 },
  { label: "Bent 1 didžioji raidė", test: (p) => /[A-Z]/.test(p) },
  { label: "Bent 1 mažoji raidė", test: (p) => /[a-z]/.test(p) },
  { label: "Bent 1 skaičius", test: (p) => /[0-9]/.test(p) },
  { label: "Bent 1 specialus simbolis", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Neteisingas el. pašto formatas";
    }

    if (!validatePassword(password)) {
      newErrors.password = "Slaptažodis neatitinka reikalavimų";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Slaptažodžiai nesutampa";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        navigate("/login");
        return;
      }

      if (res.status === 409) {
        setServerError("Toks el. paštas jau užregistruotas");
      } else {
        setServerError("Įvyko klaida, bandykite dar kartą");
      }
    } catch {
      setServerError("Įvyko klaida, bandykite dar kartą");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Registracija</h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              El. paštas
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="vardas@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slaptažodis
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Įveskite slaptažodį"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}

            {/* Requirements tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <p className="mb-2 text-xs font-semibold text-gray-600">
                  Slaptažodžio reikalavimai:
                </p>
                <ul className="space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req) => (
                    <li
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        req.test(password) ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <span>{req.test(password) ? "✓" : "○"}</span>
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pakartoti slaptažodį
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Pakartokite slaptažodį"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Registruojama..." : "Registruotis"}
          </button>
        </form>
      </div>
    </div>
  );
}
