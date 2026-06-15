import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import ShopLayout from '../layouts/ShopLayout'

import Login from '../pages/auth/Login'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ShopsList from '../pages/admin/ShopsList'
import CreateShop from '../pages/admin/CreateShop'
import SubscriptionManagement from '../pages/admin/SubscriptionManagement'
import ShopDashboard from '../pages/shop/ShopDashboard'
import CustomersList from '../pages/shop/CustomersList'
import CustomerProfile from '../pages/shop/CustomerProfile'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
        <Route path="shops/create" element={<CreateShop />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
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
        <Route index element={<Navigate to="/shop/dashboard" replace />} />
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="customers" element={<CustomersList />} />
        <Route path="customers/:id" element={<CustomerProfile />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
