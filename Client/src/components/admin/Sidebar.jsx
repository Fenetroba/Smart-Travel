import { NavLink, useLocation } from 'react-router-dom';

// Nav items visible to all admins
const baseNavItems = [
  { label: 'Dashboard',        path: '/admin/dashboard',  icon: '📊' },
  { label: 'Manage Hubs',      path: '/admin/hubs',       icon: '📍' },
  { label: 'Manage Transport', path: '/admin/transport',  icon: '🚌' },
  { label: 'Manage Routes',    path: '/admin/routes',     icon: '🗺️' },
  { label: 'Analytics',        path: '/admin/analytics',  icon: '📈' },
  { label: 'Chat',             path: '/admin/chat',       icon: '💬' },
];

// Extra items only for superadmin
const superadminNavItems = [
  { label: 'Manage Admins', path: '/admin/users', icon: '👥' },
];

export default function Sidebar({ isOpen, onClose, role }) {
  useLocation();

  const navItems = role === 'superadmin'
    ? [...baseNavItems, ...superadminNavItems]
    : baseNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <span className="text-xl">🗺️</span>
        <div>
          <span className="text-white font-semibold text-lg block">Smart Travel AA</span>
          {role === 'superadmin' && (
            <span className="text-xs text-[#10B981] font-medium">Super Admin</span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${
                isActive
                  ? 'bg-[#2563EB]/20 text-[#2563EB] border-l-2 border-[#2563EB]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to App */}
      <div className="border-t border-white/10 py-4">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all text-white/60 hover:text-white hover:bg-white/5"
        >
          <span>←</span>
          <span>Back to App</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 min-h-screen bg-[#0F172A] border-r border-white/10">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-white/10 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
