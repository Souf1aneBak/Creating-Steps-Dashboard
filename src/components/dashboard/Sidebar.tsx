'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface LinkItem {
  name: string;
  href: string;
  icon: string;
}

const superAdminLinks: LinkItem[] = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: '🏠' },
  { name: 'Users', href: '/dashboard/super-admin/users-management', icon: '👥' },
  { name: 'filling forms', href: '/dashboard/super-admin/forms', icon: '📝' },
  { name: 'Commande Clients', href: '/dashboard/super-admin/CommandeClient', icon: '💼' },
   { name: 'Clients', href: '/dashboard/super-admin/ClientsManagement', icon: '👥' },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: '⚙️' },
];

const commercialLinks: LinkItem[] = [
  { name: 'Dashboard', href: '/dashboard/commercial', icon: '🏠' },
  { name: 'Commande Clients', href: '/dashboard/commercial/commande_client', icon: '💼' },
  { name: 'Clients', href: '/dashboard/commercial/ClientsManagement', icon: '👥' },
 
];

const assistantLinks: LinkItem[] = [
  { name: 'Dashboard', href: '/dashboard/assitance/forms', icon: '🏠' },
  { name: 'Manage Clients', href: '/dashboard/assitance/clients', icon: '👥' },
  { name: 'Settings', href: '/dashboard/assitance/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true); 

  useEffect(() => {
    setRole(sessionStorage.getItem('userRole'));
  }, []);

  if (!role) return null;

  let links: LinkItem[] = [];
  if (role === 'superadmin') links = superAdminLinks;
  else if (role === 'commercial') links = commercialLinks;
  else if (role === 'assistance') links = assistantLinks;

 
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className={`bg-white border-r min-h-screen flex flex-col transition-all duration-300
      ${isOpen ? 'w-64' : 'w-16'} 
      shadow-md`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className={`font-bold text-lg text-blue-700 ${isOpen ? 'block' : 'hidden'}`}>
            Menu
          </h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle sidebar"
            className="text-gray-500 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? '⬅️' : '➡️'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                transition-colors duration-200
                ${isActive(item.href)
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}
                `}
              aria-current={isActive(item.href) ? 'page' : undefined}
              title={isOpen ? undefined : item.name}
            >
              <span className="text-lg">{item.icon}</span>
              {isOpen && item.name}
            </Link>
          ))}
        </nav>

        <footer className="p-4 border-t text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Ezza_Creative
        </footer>
      </div>
    </aside>
  );
}
