'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DashboardNavbar } from '@/components/dashboard/navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Image, Video, CalendarOff, Save, Trash2, Plus, Share2, Facebook, Instagram, Twitter, MessageCircle, Youtube, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
};

type Availability = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type DayOff = {
  id: string;
  date: string;
  reason?: string;
};

type Media = {
  id: string;
  mediaUrl: string;
  mediaType: 'PHOTO' | 'VIDEO';
  title?: string;
  description?: string;
};

const daysOfWeek = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export default function BarberDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Day Off form state
  const [dayOffDate, setDayOffDate] = useState('');
  const [dayOffReason, setDayOffReason] = useState('');
  const [dayOffDialogOpen, setDayOffDialogOpen] = useState(false);

  // Media form state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Social media form state
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [zelleEmail, setZelleEmail] = useState('');
  const [zellePhone, setZellePhone] = useState('');
  const [cashappTag, setCashappTag] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'BARBER') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load appointments
      const appointmentsRes = await fetch('/api/appointments');
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData.appointments || []);

      // Load availability
      const availabilityRes = await fetch('/api/barber/availability');
      const availabilityData = await availabilityRes.json();
      setAvailability(Array.isArray(availabilityData) ? availabilityData : []);

      // Load days off
      const daysOffRes = await fetch('/api/barber/days-off');
      const daysOffData = await daysOffRes.json();
      setDaysOff(daysOffData || []);

      // Load media
      const mediaRes = await fetch('/api/barber/media');
      const mediaData = await mediaRes.json();
      setMedia(mediaData || []);

      // Load barber profile
      const profileRes = await fetch('/api/barber/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setBio(profileData.bio || '');
        setSpecialties(profileData.specialties || '');
        setHourlyRate(profileData.hourlyRate?.toString() || '');
        setPhone(profileData.phone || '');
        setFacebookUrl(profileData.facebookUrl || '');
        setInstagramUrl(profileData.instagramUrl || '');
        setTwitterUrl(profileData.twitterUrl || '');
        setTiktokUrl(profileData.tiktokUrl || '');
        setYoutubeUrl(profileData.youtubeUrl || '');
        setWhatsappUrl(profileData.whatsappUrl || '');
        setZelleEmail(profileData.zelleEmail || '');
        setZellePhone(profileData.zellePhone || '');
        setCashappTag(profileData.cashappTag || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (day: Availability) => {
    try {
      const currentAvailability = Array.isArray(availability) ? availability : [];
      const updatedAvailability = currentAvailability.map((a) =>
        a.dayOfWeek === day.dayOfWeek ? day : a
      );

      const res = await fetch('/api/barber/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: updatedAvailability }),
      });

      if (!res.ok) throw new Error('Error al actualizar disponibilidad');

      const data = await res.json();
      setAvailability(Array.isArray(data.availability) ? data.availability : []);
      toast.success('Disponibilidad actualizada exitosamente');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error al actualizar la disponibilidad');
    }
  };

  const addDayOff = async () => {
    if (!dayOffDate) {
      toast.error('Por favor selecciona una fecha');
      return;
    }

    try {
      const res = await fetch('/api/barber/days-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dayOffDate,
          reason: dayOffReason,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al agregar día libre');
      }

      const data = await res.json();
      setDaysOff([...daysOff, data.dayOff]);
      toast.success('Día libre agregado exitosamente');
      setDayOffDialogOpen(false);
      setDayOffDate('');
      setDayOffReason('');
    } catch (error: any) {
      console.error('Error adding day off:', error);
      toast.error(error.message || 'Error al agregar día libre');
    }
  };

  const deleteDayOff = async (id: string) => {
    try {
      const res = await fetch(`/api/barber/days-off?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar día libre');

      setDaysOff(daysOff.filter((d) => d.id !== id));
      toast.success('Día libre eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting day off:', error);
      toast.error('Error al eliminar día libre');
    }
  };

  const addMedia = async () => {
    if (!mediaFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('mediaType', mediaType);
      if (mediaTitle) formData.append('title', mediaTitle);
      if (mediaDescription) formData.append('description', mediaDescription);

      const res = await fetch('/api/barber/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al agregar media');
      }

      const data = await res.json();
      setMedia([data.media, ...media]);
      toast.success('Media agregada exitosamente');
      setMediaDialogOpen(false);
      setMediaFile(null);
      setMediaTitle('');
      setMediaDescription('');
    } catch (error: any) {
      console.error('Error adding media:', error);
      toast.error(error.message || 'Error al agregar media');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/barber/media/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar media');

      setMedia(media.filter((m) => m.id !== id));
      toast.success('Media eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Error al eliminar media');
    }
  };

  const updateProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await fetch('/api/barber/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          specialties,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          phone,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          tiktokUrl,
          youtubeUrl,
          whatsappUrl,
          zelleEmail,
          zellePhone,
          cashappTag,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar perfil');
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#00f0ff]">Cargando...</div>
      </div>
    );
  }

  // Get today's and upcoming appointments
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter((apt) => apt.date >= today && apt.status !== 'CANCELLED')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#00f0ff]">Mi Panel de Barbero</h1>
        </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black">
            <Calendar className="w-4 h-4 mr-2" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="hours" className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="days-off" className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black">
            <CalendarOff className="w-4 h-4 mr-2" />
            Días Libres
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black">
            <Image className="w-4 h-4 mr-2" />
            Galería
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black">
            <Share2 className="w-4 h-4 mr-2" />
            Redes Sociales
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-[#00f0ff]">Próximas Citas</CardTitle>
              <CardDescription>Tus citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tienes citas próximas</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-lg border border-zinc-800 bg-black hover:border-[#00f0ff] transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <p className="font-semibold text-white">{apt.client.name}</p>
                          <p className="text-sm text-[#ffd700]">{apt.service.name}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(apt.date).toLocaleDateString('es-ES')} a las {apt.time}
                          </p>
                          <p className="text-xs text-gray-500">Duración: {apt.service.duration} min</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={
                              apt.status === 'CONFIRMED'
                                ? 'px-3 py-1 rounded-full text-xs bg-green-900 text-green-300'
                                : 'px-3 py-1 rounded-full text-xs bg-yellow-900 text-yellow-300'
                            }
                          >
                            {apt.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-[#00f0ff]">Horario Semanal</CardTitle>
              <CardDescription>Configura tu disponibilidad para cada día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayAvailability = (Array.isArray(availability) ? availability : []).find(
                    (a) => a.dayOfWeek === day.value
                  ) || {
                    id: '',
                    dayOfWeek: day.value,
                    startTime: '09:00',
                    endTime: '18:00',
                    isAvailable: true,
                  };

                  return (
                    <div
                      key={day.value}
                      className="p-4 rounded-lg border border-zinc-800 bg-black"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-32">
                            <p className="font-semibold text-white">{day.label}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={dayAvailability.isAvailable}
                              onCheckedChange={(checked) => {
                                updateAvailability({
                                  ...dayAvailability,
                                  isAvailable: checked,
                                });
                              }}
                            />
                            <span className="text-sm text-gray-400">
                              {dayAvailability.isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                          </div>
                          {dayAvailability.isAvailable && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={dayAvailability.startTime}
                                onChange={(e) => {
                                  updateAvailability({
                                    ...dayAvailability,
                                    startTime: e.target.value,
                                  });
                                }}
                                className="w-32 bg-zinc-800 border-zinc-700"
                              />
                              <span className="text-gray-400">-</span>
                              <Input
                                type="time"
                                value={dayAvailability.endTime}
                                onChange={(e) => {
                                  updateAvailability({
                                    ...dayAvailability,
                                    endTime: e.target.value,
                                  });
                                }}
                                className="w-32 bg-zinc-800 border-zinc-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Days Off Tab */}
        <TabsContent value="days-off" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[#00f0ff]">Días Libres</CardTitle>
                  <CardDescription>Gestiona tus días libres</CardDescription>
                </div>
                <Dialog open={dayOffDialogOpen} onOpenChange={setDayOffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00f0ff] text-black hover:bg-[#00d4dd]">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Día Libre
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-[#00f0ff]">Agregar Día Libre</DialogTitle>
                      <DialogDescription>
                        Selecciona una fecha para marcar como día libre
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={dayOffDate}
                          onChange={(e) => setDayOffDate(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Razón (opcional)</Label>
                        <Textarea
                          id="reason"
                          value={dayOffReason}
                          onChange={(e) => setDayOffReason(e.target.value)}
                          placeholder="Ej: Vacaciones, asunto personal..."
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <Button
                        onClick={addDayOff}
                        className="w-full bg-[#00f0ff] text-black hover:bg-[#00d4dd]"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {daysOff.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No tienes días libres programados
                </p>
              ) : (
                <div className="space-y-4">
                  {daysOff.map((dayOff) => (
                    <div
                      key={dayOff.id}
                      className="p-4 rounded-lg border border-zinc-800 bg-black flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {new Date(dayOff.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {dayOff.reason && (
                          <p className="text-sm text-gray-400 mt-1">{dayOff.reason}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteDayOff(dayOff.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[#00f0ff]">Mi Galería</CardTitle>
                  <CardDescription>
                    Sube fotos y videos de tu trabajo para mostrar en tu perfil
                  </CardDescription>
                </div>
                <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ffd700] text-black hover:bg-[#ffed4e]">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Media
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-[#00f0ff]">Agregar Foto o Video</DialogTitle>
                      <DialogDescription>
                        Sube una foto o video desde tu dispositivo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mediaType">Tipo</Label>
                        <Select value={mediaType} onValueChange={(value: any) => setMediaType(value)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="PHOTO">Foto</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mediaFile">Archivo</Label>
                        <Input
                          id="mediaFile"
                          type="file"
                          accept={mediaType === 'PHOTO' ? 'image/*' : 'video/*'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setMediaFile(file);
                          }}
                          className="bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        {mediaFile && (
                          <p className="text-xs text-gray-400 mt-2">
                            Archivo seleccionado: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {mediaType === 'PHOTO' 
                            ? 'Imágenes: máximo 50MB (JPEG, PNG, WebP, GIF)' 
                            : 'Videos: máximo 100MB (MP4, MOV, WebM)'}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="mediaTitle">Título (opcional)</Label>
                        <Input
                          id="mediaTitle"
                          value={mediaTitle}
                          onChange={(e) => setMediaTitle(e.target.value)}
                          placeholder="Título de la foto/video"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mediaDescription">Descripción (opcional)</Label>
                        <Textarea
                          id="mediaDescription"
                          value={mediaDescription}
                          onChange={(e) => setMediaDescription(e.target.value)}
                          placeholder="Describe tu trabajo..."
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <Button
                        onClick={addMedia}
                        disabled={uploading}
                        className="w-full bg-[#ffd700] text-black hover:bg-[#ffed4e] disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {uploading ? 'Subiendo...' : 'Guardar'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {media.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No tienes fotos o videos en tu galería
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-black"
                    >
                      <div className="aspect-square relative">
                        {item.mediaType === 'PHOTO' ? (
                          <img
                            src={item.mediaUrl}
                            alt={item.title || 'Galería'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={item.mediaUrl}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                          <Button
                            onClick={() => deleteMedia(item.id)}
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      {(item.title || item.description) && (
                        <div className="p-3">
                          {item.title && (
                            <p className="font-semibold text-white text-sm">{item.title}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-[#00f0ff]">Perfil y Redes Sociales</CardTitle>
              <CardDescription>Actualiza tu información de perfil y enlaces de redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Información del Perfil</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntale a tus clientes sobre ti..."
                      className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialties">Especialidades</Label>
                    <Input
                      id="specialties"
                      value={specialties}
                      onChange={(e) => setSpecialties(e.target.value)}
                      placeholder="Ej: Fade, Pompadour, Diseños"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="25.00"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Redes Sociales</h3>
                <p className="text-sm text-gray-400">Agrega tus enlaces de redes sociales para que los clientes puedan conectarse contigo</p>
                
                <div className="grid gap-4">
                  {/* Facebook */}
                  <div>
                    <Label htmlFor="facebook" className="flex items-center">
                      <Facebook className="w-4 h-4 mr-2 text-blue-500" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/tu-perfil"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <Label htmlFor="instagram" className="flex items-center">
                      <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/tu-usuario"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <Label htmlFor="twitter" className="flex items-center">
                      <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/tu-usuario"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  {/* TikTok */}
                  <div>
                    <Label htmlFor="tiktok" className="flex items-center">
                      <Video className="w-4 h-4 mr-2 text-gray-300" />
                      TikTok
                    </Label>
                    <Input
                      id="tiktok"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@tu-usuario"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <Label htmlFor="youtube" className="flex items-center">
                      <Youtube className="w-4 h-4 mr-2 text-red-500" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@tu-canal"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      value={whatsappUrl}
                      onChange={(e) => setWhatsappUrl(e.target.value)}
                      placeholder="https://wa.me/1234567890"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-[#ffd700]" />
                  Formas de Pago Personales
                </h3>
                <p className="text-sm text-gray-400">Configura tus cuentas personales para recibir pagos directamente de tus clientes</p>
                
                <div className="grid gap-4">
                  {/* Zelle Email */}
                  <div>
                    <Label htmlFor="zelleEmail" className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-purple-400" />
                      Zelle - Email
                    </Label>
                    <Input
                      id="zelleEmail"
                      type="email"
                      value={zelleEmail}
                      onChange={(e) => setZelleEmail(e.target.value)}
                      placeholder="tu-email@ejemplo.com"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email registrado en Zelle</p>
                  </div>

                  {/* Zelle Phone */}
                  <div>
                    <Label htmlFor="zellePhone" className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-purple-400" />
                      Zelle - Teléfono
                    </Label>
                    <Input
                      id="zellePhone"
                      type="tel"
                      value={zellePhone}
                      onChange={(e) => setZellePhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Teléfono registrado en Zelle</p>
                  </div>

                  {/* CashApp */}
                  <div>
                    <Label htmlFor="cashapp" className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                      CashApp - $Cashtag
                    </Label>
                    <Input
                      id="cashapp"
                      value={cashappTag}
                      onChange={(e) => setCashappTag(e.target.value)}
                      placeholder="$tuusuario"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tu $cashtag de CashApp (ej: $JohnDoe)</p>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={updateProfile}
                  disabled={savingProfile}
                  className="w-full bg-gradient-to-r from-[#00f0ff] to-[#ffd700] text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
