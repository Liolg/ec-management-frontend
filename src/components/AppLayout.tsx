import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  Package,
  Layers,
  Wrench,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  BarChart2,
  PieChart,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import faviconUrl from '../assets/favicon.svg'

interface NavGroup {
  label: string
  items: { to: string; label: string; icon: React.ElementType }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Products',
    items: [
      { to: '/products',             label: 'Products',     icon: Package },
      { to: '/products/materials',   label: 'Materials',    icon: Layers },
      { to: '/products/labors',      label: 'Labors',       icon: Wrench },
      { to: '/products/costsheets',  label: 'Cost Sheets',  icon: Receipt },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { to: '/transactions/sales',      label: 'Sales',      icon: TrendingUp },
      { to: '/transactions/purchases',  label: 'Purchases',  icon: ShoppingCart },
      { to: '/transactions/expenses',   label: 'Expenses',   icon: TrendingDown },
      { to: '/transactions/payments',   label: 'Payments',   icon: CreditCard },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/reports/profit-loss', label: 'Profit & Loss', icon: BarChart2 },
      { to: '/reports/inventory',   label: 'Inventory',     icon: PieChart },
    ],
  },
]

const topLinks = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts',  icon: BookOpen },
  { to: '/entries',  label: 'Entries',   icon: FileText },
  { to: '/setup',    label: 'Setup',     icon: Settings },
]

function linkClass(isActive: boolean) {
  return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
    isActive ? 'bg-brand text-white' : 'hover:bg-gray-800 text-gray-300'
  }`
}

function GroupSection({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
      >
        {group.label}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {group.items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => linkClass(isActive)}
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AppLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="px-6 py-5 text-white font-semibold text-lg border-b border-gray-700 flex items-center gap-3">
          <img src={faviconUrl} width={22} height={21} alt="" />
          EC Management
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {topLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => linkClass(isActive)}
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}

          <div className="my-2 border-t border-gray-700" />

          <div className="flex flex-col gap-3">
            {navGroups.map(group => (
              <GroupSection key={group.label} group={group} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 text-left transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
