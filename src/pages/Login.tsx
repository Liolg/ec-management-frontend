import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import faviconUrl from '../assets/favicon.svg'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' })
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const errors = { username: '', password: '' }
    if (!username.trim()) errors.username = 'Username is required'
    if (password.length < 3) errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return !errors.username && !errors.password
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setApiError(null)
    setLoading(true)
    try {
      await signIn(username, password)
      navigate('/')
    } catch {
      setApiError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <img src={faviconUrl} width={32} height={30} alt="" />
          <h1 className="text-2xl font-semibold text-gray-900">EC Management</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
