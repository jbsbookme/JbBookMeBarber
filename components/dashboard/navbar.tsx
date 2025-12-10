'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scissors, LogOut, User, Calendar, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DashboardNavbar() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-[#00f0ff] to-[#0099cc] p-2 rounded-lg">
            <Scissors className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold text-white">
            Barbería <span className="text-[#00f0ff]">Premium</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/inicio">
            <Button variant="ghost" className="text-gray-300 hover:text-[#00f0ff] hover:bg-transparent">
              <Home className="w-5 h-5 mr-2" />
              Inicio
            </Button>
          </Link>
          {session?.user?.role === 'CLIENT' && (
            <Link href="/reservar">
              <Button variant="ghost" className="text-gray-300 hover:text-[#00f0ff] hover:bg-transparent">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar
              </Button>
            </Link>
          )}
          <div className="flex items-center space-x-2 text-gray-300">
            <User className="w-5 h-5" />
            <span className="text-sm">{session?.user?.name || 'Usuario'}</span>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-gray-700 text-white hover:bg-red-500/20 hover:border-red-500 hover:text-red-500"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </nav>
  );
}