import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, ArrowLeft, Star, Calendar } from 'lucide-react';

export default async function BarberosPage() {
  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    include: {
      user: true,
      services: {
        where: { isActive: true },
      },
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  const barbersWithRatings = barbers.map((barber) => {
    const totalRating = barber.reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = barber.reviews.length > 0 ? totalRating / barber.reviews.length : 0;

    return {
      ...barber,
      avgRating: Number(avgRating.toFixed(1)),
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-[#00f0ff] to-[#0099cc] p-2 rounded-lg">
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              Barbería <span className="text-[#00f0ff]">Premium</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-300 hover:text-[#00f0ff]">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-[#0a0a0a] hover:text-[#00f0ff]">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestros <span className="text-[#00f0ff] neon-text">Barberos</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Conoce a nuestro equipo de profesionales expertos en el arte de la barbería
          </p>
        </div>

        {/* Barbers Grid */}
        {barbersWithRatings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hay barberos disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbersWithRatings.map((barber, index) => (
              <Card
                key={barber.id}
                className="bg-[#1a1a1a] border-gray-800 hover:border-[#00f0ff] transition-all duration-300 group animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[#00f0ff]/10 to-[#0099cc]/10">
                    {barber.user?.image ? (
                      <img
                        src={barber.user.image}
                        alt={barber.user?.name || 'Barbero'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Scissors className="w-20 h-20 text-[#00f0ff]/30" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-white text-2xl">{barber.user?.name || 'Barbero'}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {barber.specialties || 'Especialista en cortes'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-[#ffd700] fill-current" />
                      <span className="text-[#ffd700] font-semibold">
                        {barber.avgRating > 0 ? barber.avgRating.toFixed(1) : 'Nuevo'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({barber._count?.reviews || 0} reseñas)
                      </span>
                    </div>
                    {barber.hourlyRate && (
                      <span className="text-[#00f0ff] font-semibold">${barber.hourlyRate}/hr</span>
                    )}
                  </div>

                  {/* Bio */}
                  {barber.bio && (
                    <p className="text-gray-400 text-sm line-clamp-2">{barber.bio}</p>
                  )}

                  {/* Services Count */}
                  <div className="text-gray-500 text-sm">
                    {barber.services?.length || 0} servicios disponibles
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/barberos/${barber.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff]">
                        Ver Perfil
                      </Button>
                    </Link>
                    <Link href={`/reservar?barberId=${barber.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-[#00f0ff] to-[#0099cc] text-black hover:opacity-90">
                        <Calendar className="w-4 h-4 mr-2" />
                        Reservar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
