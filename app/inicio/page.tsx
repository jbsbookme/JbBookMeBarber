'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Calendar,
  Scissors,
  Star,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  User,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function InicioPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (session?.user?.role === 'CLIENT') {
      fetchClientStats();
    }
  }, [session, status, router]);

  const fetchClientStats = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      
      if (res.ok && data.appointments) {
        const now = new Date();
        const upcoming = data.appointments.filter((apt: any) => {
          const aptDate = new Date(apt.date);
          return aptDate >= now && apt.status === 'CONFIRMED';
        });
        
        setStats({
          upcomingAppointments: upcoming.length,
          totalAppointments: data.appointments.length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  const navigationCards = [
    {
      title: 'Reservar Cita',
      description: 'Agenda tu próxima visita con tu barbero favorito',
      icon: Calendar,
      href: '/reservar',
      color: 'from-[#00f0ff] to-[#0099cc]',
      gradient: 'bg-gradient-to-br from-[#00f0ff]/20 to-[#0099cc]/20',
    },
    {
      title: 'Mi Perfil',
      description: 'Ver y editar tu información personal',
      icon: User,
      href: '/dashboard/cliente',
      color: 'from-[#ffd700] to-[#ffaa00]',
      gradient: 'bg-gradient-to-br from-[#ffd700]/20 to-[#ffaa00]/20',
    },
    {
      title: 'Galería',
      description: 'Explora nuestros mejores trabajos',
      icon: ImageIcon,
      href: '/galeria',
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Reseñas',
      description: 'Lee las experiencias de otros clientes',
      icon: Star,
      href: '/resenas',
      color: 'from-yellow-500 to-orange-500',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
    },
    {
      title: 'Ubicación',
      description: 'Encuentra nuestra barbería fácilmente',
      icon: MapPin,
      href: '/ubicacion',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    },
    {
      title: 'Asistente Virtual',
      description: 'Obtén ayuda instantánea de nuestra IA',
      icon: MessageSquare,
      href: '/asistente',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 via-black to-black"></div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 pt-20 pb-16">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-[#00f0ff]" />
              <span className="text-[#00f0ff] font-semibold">Bienvenido a tu barbería premium</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Hola, <span className="bg-gradient-to-r from-[#00f0ff] to-[#ffd700] bg-clip-text text-transparent">
                {session?.user?.name || 'Cliente'}
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tu estilo, nuestra pasión. Explora nuestros servicios y agenda tu próxima transformación.
            </p>
          </motion.div>

          {/* Stats Cards - Solo para clientes */}
          {session?.user?.role === 'CLIENT' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16"
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-[#00f0ff]/20 rounded-lg">
                    <Clock className="w-8 h-8 text-[#00f0ff]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Citas Próximas</p>
                    <p className="text-3xl font-bold text-white">{stats.upcomingAppointments}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-[#ffd700]/20 rounded-lg">
                    <Award className="w-8 h-8 text-[#ffd700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Citas Totales</p>
                    <p className="text-3xl font-bold text-white">{stats.totalAppointments}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {navigationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Card className={`bg-gray-900 border-gray-800 hover:border-[#00f0ff] transition-all duration-300 h-full group overflow-hidden relative`}>
                      {/* Background gradient on hover */}
                      <div className={`absolute inset-0 ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <CardContent className="p-8 relative z-10">
                        <div className={`p-4 bg-gradient-to-br ${card.color} rounded-xl inline-block mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#00f0ff] transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {card.description}
                        </p>
                        
                        {/* Arrow indicator */}
                        <div className="mt-4 flex items-center text-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-semibold mr-2">Ir</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <Link href="/reservar">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00f0ff] to-[#ffd700] text-black font-bold text-lg px-12 py-6 hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all duration-300 group"
              >
                <Scissors className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Reserva tu Cita Ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20"></div>
    </div>
  );
}
