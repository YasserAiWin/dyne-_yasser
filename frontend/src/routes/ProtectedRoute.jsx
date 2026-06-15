import { Navigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from '../services/authService'

// Guards a route by auth + (optionally) role.
export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()
  if (role && user?.role !== role) {
    // Send the user to their own home if role mismatches.
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/shop/dashboard'} replace />
  }

  return children
}
