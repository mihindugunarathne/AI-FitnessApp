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
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
          {state === 'login' ? "Sign In" : "Sign Up"}
        </h2>
        <p className="mt-2 text-sm text-gray-500/90 dark:text-slate-400">
          {state === 'login' ? "Please enter your email and password to access" : "Please enter your details to create an account"}
        </p>

        {/* Username */}
        {state !== 'login' &&(
          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-slate-300">Username</label>
            <div className="relative mt-2">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
              <input onChange={(e) => setUsername(e.target.value)} value={username}
               type="text" placeholder="enter your username" className="login-input" required/> 
            </div>
          </div>
        )}
        {/* Email */}
        <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-slate-300">Email</label>
          <div className="relative mt-2">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
            <input onChange={(e) => setEmail(e.target.value)} value={email} 
            type="email" placeholder="enter your email" className="login-input" required/>
          </div>
        </div>

        {/* Password */}
        <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-slate-300">Password</label>
          <div className="relative mt-2">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
            <input onChange={(e) => setPassword(e.target.value)} value={password} 
            type={showPassword ? "text" : "password"} placeholder="enter your password" 
            className="login-input pr-10" required/>
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword((p)=>!p)}>
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="login-button" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : state === "login" ? 'login': 'Sign up'}
        </button>

        {state === 'login' ? (
          <p className="mt-4 text-sm text-center text-gray-500/90 dark:text-slate-400">
            Don't have an account? <button className="text-green-600 hover:underline" onClick={() => setState('sign up')}>Sign up</button>
          </p>
        ) : (
          <p className="mt-4 text-sm text-center text-gray-500/90 dark:text-slate-400">
            Already have an account? <button className="text-green-600 hover:underline" onClick={() => setState('login')}>Login</button>
          </p>
        )}        
      </form>
    </main>
   </>
  )
}

export default Login