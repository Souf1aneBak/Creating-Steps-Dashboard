'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROLES } from '@/constants/roles';
import { useState, useEffect } from 'react';

interface LinkItem {
  name: string;
  href: string;
  icon: string;
}

const superAdminLinks: LinkItem[] = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: '🏠' },
  { name: 'Users', href: '/dashboard/super-admin/users-management', icon: '👥' },
  { name: 'Commande Clients', href: '/dashboard/super-admin/CommandeClient', icon: '💼' },
  { name: 'Form Responses', href: '/dashboard/super-admin/forms/responses', icon: '📝' },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: '⚙️' },
];

const commercialLinks: LinkItem[] = [
  { name: 'Dashboard', href: '/dashboard/commercial', icon: '🏠' },
  { name: 'Commande Clients', href: '/dashboard/commercial/commande_client', icon: '💼' },
  { name: 'Form Responses', href: '/dashboard/commercial/forms/responses', icon: '📝' },
  { name: 'Generate Reports / Quotes', href: '/dashboard/commercial/reports', icon: '📊' },
  { name: 'Export Data', href: '/dashboard/commercial/export', icon: '⬇️' },
  { name: 'Status Tracking', href: '/dashboard/commercial/status-tracking', icon: '⏳' },
  
];

const assistantLinks: LinkItem[] = [
  { name: 'View Submitted Forms', href: '/dashboard/assistant/forms/submitted', icon: '📋' },
  { name: 'Moderate Responses', href: '/dashboard/assistant/forms/moderate', icon: '✅' },
  { name: 'Manage Tasks', href: '/dashboard/assistant/tasks', icon: '📝' },
  { name: 'Data Cleanup & Reports', href: '/dashboard/assistant/data-cleanup', icon: '🧹' },
  { name: 'Notifications & Reminders', href: '/dashboard/assistant/notifications', icon: '🔔' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(sessionStorage.getItem('userRole')); 
  }, []);

  if (!role) {
    return null; 
  }

  let links: LinkItem[] = [];
  if (role === ROLES.SUPERADMIN) links = superAdminLinks;
  else if (role === ROLES.COMMERCIAL) links = commercialLinks;
  else if (role === ROLES.ASSISTANCE) links = assistantLinks;

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 h-screen border-r border-gray-200 bg-white">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {links.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
