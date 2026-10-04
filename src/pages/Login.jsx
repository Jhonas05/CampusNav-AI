import { LockKeyhole, LogIn, LogOut } from "lucide-react"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import CampusGraphBackground from "@/components/motion/CampusGraphBackground"
import { BlueprintPanel, button, InkKicker } from "@/components/campus/ui"
import { useAuth } from "@/contexts/AuthContext"
import { BACKEND_MODES } from "@/lib/supabaseClient"

// Same-origin paths only: no protocol-relative ("//"), no backslashes (some
// browsers treat "/\\host" as "//host"), and no control characters.
const safeReturnPath = (value) => typeof value === "string" && /^\/(?![\/\\])[^\\\u0000-\u001f]*$/.test(value) ? value : "/dashboard"

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const submit = async (event) => {
    event.preventDefault()
    const result = await auth.signIn({ email: email.trim(), password })
    if (result.ok) navigate(safeReturnPath(searchParams.get("returnTo")), { replace: true })
  }

  return (
    <div className="relative min-h-[calc(100dvh-var(--app-header-height))] overflow-hidden bg-canvas px-4 py-14 sm:px-6">
      <CampusGraphBackground dense={false} className="opacity-60" />
      <BlueprintPanel className="relative mx-auto max-w-md p-7 sm:p-9" aria-labelledby="login-title">
        <div className="flex items-center gap-3">
          <SchoolLogo size="lg" />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <InkKicker className="mt-7">St. Clare College of Caloocan · CampusNav account</InkKicker>
        <h1 id="login-title" className="mt-2 font-display text-[1.75rem] font-semibold tracking-[-0.02em]">{auth.isAuthenticated ? "Session active" : "Sign in"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">Public campus navigation remains available without an account.</p>

        <div role="status" className="mt-6 rounded-2xl border border-line bg-fill p-4 text-sm">
          <p className="font-semibold">{auth.backendStatus === "SUPABASE_CONNECTED" ? "Backend: Connected / Supabase" : auth.backendStatus === "SUPABASE_OFFLINE" ? "Backend: Supabase Offline / Fallback" : "Backend: Local Prototype Mode"}</p>
          {auth.backendMode === BACKEND_MODES.LOCAL && <p className="mt-1 text-xs text-ink-soft">Configure the frontend-safe Supabase URL and anon key to enable sign in.</p>}
        </div>

        {auth.isAuthenticated ? (
          <div className="mt-6">
            <p className="text-sm text-ink-soft">Signed in as <span className="font-medium text-ink">{auth.profile?.display_name || auth.user?.email || "CampusNav user"}</span></p>
            <button type="button" disabled={auth.loading} onClick={() => auth.signOut()} className={`${button.outline} mt-5 w-full`}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
            </button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium">
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
            </label>
            {auth.error && <p role="alert" className="rounded-xl border border-line-strong bg-fill p-3 text-ink text-sm font-medium">{auth.error.message}</p>}
            <button type="submit" disabled={auth.loading || auth.backendMode === BACKEND_MODES.LOCAL} className={`${button.primary} w-full`}>
              <LogIn className="h-4 w-4" aria-hidden="true" /> {auth.loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}
      </BlueprintPanel>
    </div>
  )
}
