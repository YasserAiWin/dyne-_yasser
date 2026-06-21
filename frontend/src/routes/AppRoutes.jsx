import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import ShopLayout from '../layouts/ShopLayout'

import Login from '../pages/auth/Login'
import AdminLogin from '../pages/auth/AdminLogin'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ShopsList from '../pages/admin/ShopsList'
import ShopDashboard from '../pages/shop/ShopDashboard'
import CustomersList from '../pages/shop/CustomersList'
import CustomerProfile from '../pages/shop/CustomerProfile'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Shop owner login */}
      <Route path="/login" element={<Login />} />

      {/* Admin login — accessed by going to /admin/login directly */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="shops" element={<ShopsList />} />
        <Route path="shops/create" element={<Navigate to="/admin/shops" replace />} />
        <Route path="subscriptions" element={<Navigate to="/admin/shops" replace />} />
      </Route>

      {/* Shop owner area */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute role="owner">
            <ShopLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/shop/customers" replace />} />
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="customers" element={<CustomersList />} />
        <Route path="customers/:id" element={<CustomerProfile />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
