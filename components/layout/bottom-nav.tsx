'use client';

import { Home, Calendar, PlusCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  // No mostrar el bottom nav en páginas de auth o dashboard
  if (pathname?.startsWith('/login') || 
      pathname?.startsWith('/registro') || 
      pathname?.startsWith('/dashboard')) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      href: '/',
      active: pathname === '/'
    },
    {
      name: 'Calendario',
      icon: Calendar,
      href: session ? '/dashboard/cliente' : '/login',
      active: pathname === '/calendario'
    },
    {
      name: 'Reservar',
      icon: PlusCircle,
      href: session ? '/reservar' : '/login',
      active: pathname === '/reservar'
    },
    {
      name: 'Perfil',
      icon: User,
      href: session ? '/dashboard' : '/login',
      active: pathname === '/perfil'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 pb-safe">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full group"
              >
                <div className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'
                }`}>
                  <Icon
                    className={`w-6 h-6 mb-1 transition-colors duration-200 ${
                      isActive 
                        ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' 
                        : 'text-gray-400 group-hover:text-[#ffd700]'
                    }`}
                  />
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-[#00f0ff]' 
                      : 'text-gray-400 group-hover:text-[#ffd700]'
                  }`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}