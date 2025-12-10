import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { DashboardNavbar } from '@/components/dashboard/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Star, TrendingUp, Scissors, Wallet, FileText, Image as ImageIcon, MapPin, Share2, Bot } from 'lucide-react';
import { AppointmentStatus } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Get statistics
  const totalAppointments = await prisma.appointment.count();
  const completedAppointments = await prisma.appointment.count({
    where: { status: AppointmentStatus.COMPLETED },
  });
  const pendingAppointments = await prisma.appointment.count({
    where: { status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] } },
  });

  const totalClients = await prisma.user.count({
    where: { role: 'CLIENT' },
  });

  const totalBarbers = await prisma.barber.count({
    where: { isActive: true },
  });

  const totalReviews = await prisma.review.count();

  const reviews = await prisma.review.findMany({
    select: { rating: true },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const completedAppointmentsWithServices = await prisma.appointment.findMany({
    where: { status: AppointmentStatus.COMPLETED },
    include: { service: true },
  });

  const totalRevenue = completedAppointmentsWithServices.reduce(
    (sum, apt) => sum + (apt.service?.price ?? 0),
    0
  );

  // Recent appointments
  const recentAppointments = await prisma.appointment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, email: true } },
      barber: { include: { user: { select: { name: true } } } },
      service: true,
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'text-green-500';
      case AppointmentStatus.PENDING:
        return 'text-yellow-500';
      case AppointmentStatus.COMPLETED:
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Panel de <span className="text-[#00f0ff]">Administración</span>
          </h1>
          <p className="text-gray-400">Vista general del sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Citas Totales</CardTitle>
              <Calendar className="w-4 h-4 text-[#00f0ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#00f0ff]">{totalAppointments}</div>
              <p className="text-xs text-gray-500 mt-1">
                {pendingAppointments} pendientes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Clientes</CardTitle>
              <Users className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Barberos</CardTitle>
              <Scissors className="w-4 h-4 text-[#ffd700]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#ffd700]">{totalBarbers}</div>
              <p className="text-xs text-gray-500 mt-1">Barberos activos</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Ingresos</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">${totalRevenue.toFixed(0)}</div>
              <p className="text-xs text-gray-500 mt-1">De {completedAppointments} citas</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Calificación</CardTitle>
              <Star className="w-4 h-4 text-[#ffd700]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#ffd700]">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">{totalReviews} reseñas</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completadas</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{completedAppointments}</div>
              <p className="text-xs text-gray-500 mt-1">
                {totalAppointments > 0
                  ? ((completedAppointments / totalAppointments) * 100).toFixed(0)
                  : 0}% del total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/contabilidad">
              <Button className="w-full h-20 bg-gradient-to-r from-[#00f0ff] to-[#0099cc] text-black hover:opacity-90 text-lg">
                <Wallet className="w-6 h-6 mr-3" />
                Contabilidad
              </Button>
            </Link>
            <Link href="/dashboard/admin/servicios">
              <Button className="w-full h-20 bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-black hover:opacity-90 text-lg">
                <Scissors className="w-6 h-6 mr-3" />
                Gestionar Servicios
              </Button>
            </Link>
            <Link href="/dashboard/admin/barberos">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <Scissors className="w-6 h-6 mr-3" />
                Gestionar Barberos
              </Button>
            </Link>
            <Link href="/dashboard/admin/citas">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <Calendar className="w-6 h-6 mr-3" />
                Ver Todas las Citas
              </Button>
            </Link>
            <Link href="/dashboard/admin/resenas">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <Star className="w-6 h-6 mr-3" />
                Ver Reseñas
              </Button>
            </Link>
            <Link href="/dashboard/admin/facturas">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <FileText className="w-6 h-6 mr-3" />
                Facturas
              </Button>
            </Link>
            <Link href="/dashboard/admin/galeria">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <ImageIcon className="w-6 h-6 mr-3" />
                Gestionar Galería
              </Button>
            </Link>
            <Link href="/dashboard/admin/ubicacion">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <MapPin className="w-6 h-6 mr-3" />
                Ubicación
              </Button>
            </Link>
            <Link href="/dashboard/admin/redes-sociales">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <Share2 className="w-6 h-6 mr-3" />
                Redes Sociales
              </Button>
            </Link>
            <Link href="/dashboard/admin/asistente">
              <Button variant="outline" className="w-full h-20 border-gray-700 text-white hover:bg-[#1a1a1a] hover:border-[#00f0ff] text-lg">
                <Bot className="w-6 h-6 mr-3" />
                Asistente Virtual
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Citas Recientes</h2>
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              {recentAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay citas recientes</p>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800 hover:border-[#00f0ff] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-white">
                            {appointment.client?.name || 'Cliente'}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-gray-400">
                            {appointment.barber?.user?.name || 'Barbero'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {appointment.service?.name || 'Servicio'} • {formatDate(appointment.date)} {appointment.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[#ffd700] font-semibold">
                          ${appointment.service?.price || 0}
                        </span>
                        <span className={`text-sm ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
