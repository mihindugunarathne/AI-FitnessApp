import { useState } from "react"
import { AtSignIcon, EyeOffIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";  
import { useEffect } from "react";
import { MailIcon, LockIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";


const Login = () => {

  const [state, setState] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const navigate = useNavigate();
  const {login, signup, user} = useAppContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if(state === 'login'){
      await login({email, password})
    } else {
      await signup({username, email, password})
    }
    setIsSubmitting(false)
  }

  useEffect(() => {
    if(user){
      navigate('/')
    }
  }, [user, navigate])

  return (
    <>
      <Toaster />
      <main className="login-page-container">
        <div className="login-card">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">💪</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">FitTrack</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your daily fitness companion</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {state === 'login' ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {state === 'login' ? "Sign in to continue tracking your goals" : "Start your fitness journey today"}
            </p>

            {/* Username */}
            {state !== 'login' && (
              <div className="mt-5">
                <label className="font-medium text-sm text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative mt-1.5">
                  <AtSignIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 size-5" />
                  <input onChange={(e) => setUsername(e.target.value)} value={username}
                    type="text" placeholder="Choose a username" className="login-input pl-11" required />
                </div>
              </div>
            )}
            {/* Email */}
            <div className={state !== 'login' ? "mt-4" : "mt-5"}>
              <label className="font-medium text-sm text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative mt-1.5">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 size-5" />
                <input onChange={(e) => setEmail(e.target.value)} value={email}
                  type="email" placeholder="you@example.com" className="login-input" required />
              </div>
            </div>

            {/* Password */}
            <div className="mt-4">
              <label className="font-medium text-sm text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative mt-1.5">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 size-5" />
                <input onChange={(e) => setPassword(e.target.value)} value={password}
                  type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="login-input pr-12" required />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : state === "login" ? "Sign in" : "Create account"}
            </button>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              {state === 'login' ? (
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{" "}
                  <button type="button" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline" onClick={() => setState('sign up')}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <button type="button" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline" onClick={() => setState('login')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default Login