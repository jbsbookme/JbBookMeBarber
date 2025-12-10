'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, Star, Gift, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BienvenidaPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }

    setUserName(session.user.name || 'Cliente');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: 'Reserva tu Cita',
      description: 'Agenda con tus barberos favoritos en segundos',
      color: 'text-[#00f0ff]',
    },
    {
      icon: Star,
      title: 'Servicios Premium',
      description: 'Cortes profesionales, afeitado clásico y diseños únicos',
      color: 'text-[#ffd700]',
    },
    {
      icon: Gift,
      title: 'Programa de Lealtad',
      description: 'Acumula puntos y obtén descuentos especiales',
      color: 'text-[#00f0ff]',
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header con animación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-[#00f0ff]" strokeWidth={1.5} />
              <Sparkles className="w-8 h-8 text-[#ffd700] absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Bienvenido, <span className="bg-gradient-to-r from-[#00f0ff] to-[#ffd700] text-transparent bg-clip-text">{userName}</span>!
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Tu cuenta ha sido creada exitosamente
          </p>
          <p className="text-gray-500">
            Estás listo para vivir la mejor experiencia de barbería premium
          </p>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-[#00f0ff]/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Próximos pasos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">
                ¿Qué quieres hacer ahora?
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Elige una opción para comenzar tu experiencia premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/reservar">
                <Button
                  className="w-full bg-gradient-to-r from-[#00f0ff] to-[#0088cc] hover:from-[#00d5e6] hover:to-[#0077bb] text-black font-semibold py-6 text-lg group"
                >
                  Reservar Mi Primera Cita
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/barberos">
                <Button
                  variant="outline"
                  className="w-full border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10 py-6 text-lg"
                >
                  Conocer Nuestros Barberos
                </Button>
              </Link>

              <Link href="/galeria">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 py-6 text-lg"
                >
                  Ver Galería de Trabajos
                </Button>
              </Link>

              <Link href="/dashboard/cliente">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-zinc-800 py-6 text-lg"
                >
                  Ir a Mi Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensaje adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda? Visita nuestro{' '}
            <Link href="/asistente" className="text-[#00f0ff] hover:underline">
              Asistente Virtual
            </Link>
            {' '}o contáctanos directamente
          </p>
        </motion.div>
      </div>
    </div>
  );
}
