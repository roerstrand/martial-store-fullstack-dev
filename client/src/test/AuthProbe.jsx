import { useAuth } from '../context/AuthContext'

export default function AuthProbe() {
  const [user, isAuthenticated, login, logout, initializing] = useAuth()
  return (
    <div>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="initializing">{String(initializing)}</span>
      <button onClick={() => login({ name: 'fresh' })}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  )
}
