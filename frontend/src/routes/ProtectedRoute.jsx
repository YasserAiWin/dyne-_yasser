import { Navigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from '../services/authService'

export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    // Admins have their own login page
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />
  }

  const user = getCurrentUser()
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/shop/customers'} replace />
  }

  return children
}
