import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useAuthContext } from './context/AuthContext'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Entries from './pages/Entries'
import AppLayout from './components/AppLayout'

const Setup = lazy(() => import('./pages/Setup'))
const Products = lazy(() => import('./pages/products/Products'))
const Materials = lazy(() => import('./pages/products/Materials'))
const Labors = lazy(() => import('./pages/products/Labors'))
const CostSheets = lazy(() => import('./pages/products/CostSheets'))
const Sales = lazy(() => import('./pages/transactions/Sales'))
const Purchases = lazy(() => import('./pages/transactions/Purchases'))
const Expenses = lazy(() => import('./pages/transactions/Expenses'))
const Payments = lazy(() => import('./pages/transactions/Payments'))
const ProfitLoss = lazy(() => import('./pages/reports/ProfitLoss'))
const InventoryReport = lazy(() => import('./pages/reports/Inventory'))

const queryClient = new QueryClient()

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
        <p className="text-sm text-gray-500 font-mono bg-gray-50 rounded p-3">{message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors self-start"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <RequireAuth>
                      <AppLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/entries" element={<Entries />} />
                  <Route path="/setup" element={<Setup />} />

                  <Route path="/products" element={<Products />} />
                  <Route path="/products/materials" element={<Materials />} />
                  <Route path="/products/labors" element={<Labors />} />
                  <Route path="/products/costsheets" element={<CostSheets />} />

                  <Route path="/transactions/sales" element={<Sales />} />
                  <Route path="/transactions/purchases" element={<Purchases />} />
                  <Route path="/transactions/expenses" element={<Expenses />} />
                  <Route path="/transactions/payments" element={<Payments />} />

                  <Route path="/reports/profit-loss" element={<ProfitLoss />} />
                  <Route path="/reports/inventory" element={<InventoryReport />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
