import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Plus, 
  Users, 
  BarChart3, 
  Settings,
  Shield,
  Clock
} from 'lucide-react';
import { useAppSelector, useAuth } from '@/hooks';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'My Claims', href: '/claims', icon: FileText },
  { name: 'New Claim', href: '/claims/new', icon: Plus, roles: ['POLICYHOLDER'] },
  { name: 'Workbench', href: '/workbench', icon: Clock, roles: ['ADJUSTER', 'SUPERVISOR'] },
  { name: 'All Claims', href: '/admin/claims', icon: FileText, roles: ['SUPERVISOR', 'ADMIN'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['SUPERVISOR', 'ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useAppSelector(state => state.ui);
  const { user, hasAnyRole } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.roles || hasAnyRole(item.roles)
  );

  return (
    <div
      className={clsx(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100',
                !sidebarOpen && 'justify-center'
              )
            }
            title={!sidebarOpen ? item.name : undefined}
          >
            <item.icon size={20} />
            {sidebarOpen && (
              <span className="ml-3">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <Shield size={16} className="text-gray-400" />
              <span className="ml-2 text-xs text-gray-600">
                Logged in as {user?.role.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
