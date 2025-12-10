'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/dashboard/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Scissors, Star, Calendar, Mail, Phone, Plus, Edit2, Trash2, Upload, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter as useNextRouter } from 'next/navigation';

interface Barber {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string | null;
  hourlyRate: number | null;
  profileImage: string | null;
  isActive: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
  };
  services?: Array<any>;
  avgRating: number;
  _count?: {
    appointments: number;
    reviews: number;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function AdminBarberosPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const nextRouter = useNextRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState<string | null>(null);

  // Form state for adding new barber
  const [newBarberForm, setNewBarberForm] = useState({
    userId: '',
    name: '',
    email: '',
    bio: '',
    specialties: '',
    hourlyRate: '',
    profileImage: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    whatsappUrl: '',
  });
  const [useExistingUser, setUseExistingUser] = useState(false);

  // Form state for editing barber
  const [editBarberForm, setEditBarberForm] = useState({
    name: '',
    bio: '',
    specialties: '',
    hourlyRate: '',
    profileImage: '',
    isActive: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      fetchBarbers();
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/barbers');
      if (response.ok) {
        const data = await response.json();
        setBarbers(data.barbers || []);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Error al cargar barberos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out users who are already barbers
        const barberUserIds = barbers.map(b => b.userId);
        const availableUsers = (data.users || []).filter(
          (user: User) => !barberUserIds.includes(user.id)
        );
        setUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Image upload function
  const handleImageUpload = async (file: File, isEdit = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/barbers/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (isEdit) {
          setEditPreviewImage(data.imageUrl);
          setEditBarberForm({ ...editBarberForm, profileImage: data.imageUrl });
        } else {
          setPreviewImage(data.imageUrl);
          setNewBarberForm({ ...newBarberForm, profileImage: data.imageUrl });
        }
        toast.success('Imagen subida exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, isEdit);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isEdit = false) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file, isEdit);
    }
  };

  const handleAddBarber = async () => {
    // Validation
    if (useExistingUser) {
      if (!newBarberForm.userId) {
        toast.error('Por favor selecciona un usuario');
        return;
      }
    } else {
      if (!newBarberForm.name || !newBarberForm.email) {
        toast.error('Por favor completa el nombre y el email');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newBarberForm.email)) {
        toast.error('Por favor ingresa un email válido');
        return;
      }
    }

    setSubmitting(true);
    try {
      const body: any = {
        bio: newBarberForm.bio || null,
        specialties: newBarberForm.specialties || null,
        hourlyRate: newBarberForm.hourlyRate ? parseFloat(newBarberForm.hourlyRate) : null,
        profileImage: newBarberForm.profileImage || null,
        facebookUrl: newBarberForm.facebookUrl || null,
        instagramUrl: newBarberForm.instagramUrl || null,
        twitterUrl: newBarberForm.twitterUrl || null,
        tiktokUrl: newBarberForm.tiktokUrl || null,
        youtubeUrl: newBarberForm.youtubeUrl || null,
        whatsappUrl: newBarberForm.whatsappUrl || null,
      };

      if (useExistingUser) {
        body.userId = newBarberForm.userId;
      } else {
        body.name = newBarberForm.name;
        body.email = newBarberForm.email;
      }

      const response = await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success('Barbero agregado exitosamente');
        setIsAddDialogOpen(false);
        setNewBarberForm({
          userId: '',
          name: '',
          email: '',
          bio: '',
          specialties: '',
          hourlyRate: '',
          profileImage: '',
          facebookUrl: '',
          instagramUrl: '',
          twitterUrl: '',
          tiktokUrl: '',
          youtubeUrl: '',
          whatsappUrl: '',
        });
        setUseExistingUser(false);
        setPreviewImage(null);
        fetchBarbers();
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al agregar barbero');
      }
    } catch (error) {
      console.error('Error adding barber:', error);
      toast.error('Error al agregar barbero');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBarber = async () => {
    if (!selectedBarber) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/barbers/${selectedBarber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editBarberForm.name || null,
          bio: editBarberForm.bio || null,
          specialties: editBarberForm.specialties || null,
          hourlyRate: editBarberForm.hourlyRate ? parseFloat(editBarberForm.hourlyRate) : null,
          profileImage: editBarberForm.profileImage || null,
          isActive: editBarberForm.isActive,
        }),
      });

      if (response.ok) {
        toast.success('Barbero actualizado exitosamente');
        setIsEditDialogOpen(false);
        setSelectedBarber(null);
        fetchBarbers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar barbero');
      }
    } catch (error) {
      console.error('Error updating barber:', error);
      toast.error('Error al actualizar barbero');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBarber = async () => {
    if (!selectedBarber) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/barbers/${selectedBarber.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Barbero desactivado exitosamente');
        setIsDeleteDialogOpen(false);
        setSelectedBarber(null);
        fetchBarbers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al desactivar barbero');
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
      toast.error('Error al desactivar barbero');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (barber: Barber) => {
    setSelectedBarber(barber);
    setEditBarberForm({
      name: barber.user?.name || '',
      bio: barber.bio || '',
      specialties: barber.specialties || '',
      hourlyRate: barber.hourlyRate?.toString() || '',
      profileImage: barber.profileImage || '',
      isActive: barber.isActive,
    });
    setEditPreviewImage(barber.profileImage || null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (barber: Barber) => {
    setSelectedBarber(barber);
    setIsDeleteDialogOpen(true);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            onClick={() => nextRouter.push('/dashboard/admin')}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gestión de <span className="text-[#00f0ff]">Barberos</span>
            </h1>
            <p className="text-gray-400">Administra tu equipo de barberos profesionales</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-[#00f0ff] to-[#0099cc] text-black hover:opacity-90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Barbero
          </Button>
        </div>

        {barbers.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="py-12 text-center">
              <Scissors className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No hay barberos registrados</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                className="border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar primer barbero
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <Card
                key={barber.id}
                className="bg-[#1a1a1a] border-gray-800 hover:border-[#00f0ff] transition-all duration-300"
              >
                <CardContent className="p-6">
                  {/* Profile Image */}
                  <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[#00f0ff]/10 to-[#0099cc]/10">
                    {barber.user?.image || barber.profileImage ? (
                      <img
                        src={barber.user?.image || barber.profileImage || ''}
                        alt={barber.user?.name || 'Barbero'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Scissors className="w-20 h-20 text-[#00f0ff]/30" />
                      </div>
                    )}
                  </div>

                  {/* Barber Info */}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {barber.user?.name || 'Barbero'}
                  </h3>
                  {barber.specialties && (
                    <p className="text-[#00f0ff] text-sm mb-3">{barber.specialties}</p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {barber.user?.email && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{barber.user.email}</span>
                      </div>
                    )}
                    {barber.user?.phone && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        {barber.user.phone}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 pt-4 border-t border-gray-800 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Calificación</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-[#ffd700] fill-current mr-1" />
                        <span className="text-[#ffd700] font-semibold">
                          {barber.avgRating > 0 ? barber.avgRating : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Citas</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-[#00f0ff] mr-1" />
                        <span className="text-white font-semibold">
                          {barber._count?.appointments || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Servicios</span>
                      <span className="text-white font-semibold">
                        {barber.services?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tarifa/hora</span>
                      <span className="text-[#ffd700] font-semibold">
                        {barber.hourlyRate ? `$${barber.hourlyRate}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Estado</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          barber.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {barber.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditDialog(barber)}
                      variant="outline"
                      className="flex-1 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(barber)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Barber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#00f0ff]">Agregar Nuevo Barbero</DialogTitle>
            <DialogDescription className="text-gray-400">
              Completa la información del nuevo barbero
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle between new user and existing user */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="useExistingUser"
                checked={useExistingUser}
                onChange={(e) => setUseExistingUser(e.target.checked)}
                className="w-4 h-4 text-[#00f0ff] bg-[#0a0a0a] border-gray-700 rounded focus:ring-[#00f0ff]"
              />
              <Label htmlFor="useExistingUser" className="text-gray-300">
                Usar usuario existente
              </Label>
            </div>

            {useExistingUser ? (
              <div>
                <Label htmlFor="userId" className="text-gray-300">Usuario *</Label>
                <select
                  id="userId"
                  value={newBarberForm.userId}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, userId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={newBarberForm.name}
                    onChange={(e) => setNewBarberForm({ ...newBarberForm, name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="bg-[#0a0a0a] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBarberForm.email}
                    onChange={(e) => setNewBarberForm({ ...newBarberForm, email: e.target.value })}
                    placeholder="Ej: juan@ejemplo.com"
                    className="bg-[#0a0a0a] border-gray-700 text-white"
                  />
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="specialties" className="text-gray-300">Especialidades</Label>
              <Input
                id="specialties"
                value={newBarberForm.specialties}
                onChange={(e) => setNewBarberForm({ ...newBarberForm, specialties: e.target.value })}
                placeholder="Ej: Cortes clásicos, Barba, Diseño"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="hourlyRate" className="text-gray-300">Tarifa por hora ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={newBarberForm.hourlyRate}
                onChange={(e) => setNewBarberForm({ ...newBarberForm, hourlyRate: e.target.value })}
                placeholder="25"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-gray-300">Biografía</Label>
              <Textarea
                id="bio"
                value={newBarberForm.bio}
                onChange={(e) => setNewBarberForm({ ...newBarberForm, bio: e.target.value })}
                placeholder="Describe la experiencia y estilo del barbero..."
                className="bg-[#0a0a0a] border-gray-700 text-white"
                rows={3}
              />
            </div>

            {/* Social Media Links */}
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <h3 className="text-gray-300 font-semibold mb-2">Redes Sociales (opcional)</h3>
              
              <div>
                <Label htmlFor="facebookUrl" className="text-gray-400 text-sm">Facebook</Label>
                <Input
                  id="facebookUrl"
                  type="url"
                  value={newBarberForm.facebookUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/usuario"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="instagramUrl" className="text-gray-400 text-sm">Instagram</Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={newBarberForm.instagramUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/usuario"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="twitterUrl" className="text-gray-400 text-sm">Twitter / X</Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={newBarberForm.twitterUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/usuario"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="tiktokUrl" className="text-gray-400 text-sm">TikTok</Label>
                <Input
                  id="tiktokUrl"
                  type="url"
                  value={newBarberForm.tiktokUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, tiktokUrl: e.target.value })}
                  placeholder="https://tiktok.com/@usuario"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="youtubeUrl" className="text-gray-400 text-sm">YouTube</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={newBarberForm.youtubeUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@usuario"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="whatsappUrl" className="text-gray-400 text-sm">WhatsApp</Label>
                <Input
                  id="whatsappUrl"
                  type="url"
                  value={newBarberForm.whatsappUrl}
                  onChange={(e) => setNewBarberForm({ ...newBarberForm, whatsappUrl: e.target.value })}
                  placeholder="https://wa.me/1234567890"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Imagen de perfil</Label>
              {previewImage ? (
                <div className="relative mt-2">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setNewBarberForm({ ...newBarberForm, profileImage: '' });
                    }}
                    variant="outline"
                    className="mt-2 w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Eliminar imagen
                  </Button>
                </div>
              ) : (
                <div
                  onDrop={(e) => handleDrop(e, false)}
                  onDragOver={(e) => e.preventDefault()}
                  className="mt-2 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#00f0ff] transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                    id="barber-image-upload"
                  />
                  <label htmlFor="barber-image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      {uploadingImage ? 'Subiendo...' : 'Arrastra una imagen o haz clic para seleccionar'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Máx. 5MB</p>
                  </label>
                </div>
              )}
              <div className="mt-2">
                <Label htmlFor="profileImage-url" className="text-gray-500 text-xs">O ingresa una URL (opcional)</Label>
                <Input
                  id="profileImage-url"
                  value={newBarberForm.profileImage}
                  onChange={(e) => {
                    setNewBarberForm({ ...newBarberForm, profileImage: e.target.value });
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="https://images.pexels.com/photos/2076930/pexels-photo-2076930.jpeg?cs=srgb&dl=pexels-thgusstavo-2076930.jpg&fm=jpg"
                  className="bg-[#0a0a0a] border-gray-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsAddDialogOpen(false)}
              variant="outline"
              className="border-gray-700 text-gray-300"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddBarber}
              className="bg-gradient-to-r from-[#00f0ff] to-[#0099cc] text-black hover:opacity-90"
              disabled={submitting}
            >
              {submitting ? 'Agregando...' : 'Agregar Barbero'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Barber Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#00f0ff]">Editar Barbero</DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza la información de {selectedBarber?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-300">Nombre</Label>
              <Input
                id="edit-name"
                value={editBarberForm.name}
                onChange={(e) => setEditBarberForm({ ...editBarberForm, name: e.target.value })}
                placeholder="Nombre del barbero"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-specialties" className="text-gray-300">Especialidades</Label>
              <Input
                id="edit-specialties"
                value={editBarberForm.specialties}
                onChange={(e) => setEditBarberForm({ ...editBarberForm, specialties: e.target.value })}
                placeholder="Ej: Cortes clásicos, Barba, Diseño"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-hourlyRate" className="text-gray-300">Tarifa por hora ($)</Label>
              <Input
                id="edit-hourlyRate"
                type="number"
                value={editBarberForm.hourlyRate}
                onChange={(e) => setEditBarberForm({ ...editBarberForm, hourlyRate: e.target.value })}
                placeholder="25"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-bio" className="text-gray-300">Biografía</Label>
              <Textarea
                id="edit-bio"
                value={editBarberForm.bio}
                onChange={(e) => setEditBarberForm({ ...editBarberForm, bio: e.target.value })}
                placeholder="Describe la experiencia y estilo del barbero..."
                className="bg-[#0a0a0a] border-gray-700 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-gray-300">Imagen de perfil</Label>
              {editPreviewImage ? (
                <div className="relative mt-2">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={editPreviewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setEditPreviewImage(null);
                      setEditBarberForm({ ...editBarberForm, profileImage: '' });
                    }}
                    variant="outline"
                    className="mt-2 w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Eliminar imagen
                  </Button>
                </div>
              ) : (
                <div
                  onDrop={(e) => handleDrop(e, true)}
                  onDragOver={(e) => e.preventDefault()}
                  className="mt-2 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#00f0ff] transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                    id="edit-barber-image-upload"
                  />
                  <label htmlFor="edit-barber-image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      {uploadingImage ? 'Subiendo...' : 'Arrastra una imagen o haz clic para seleccionar'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Máx. 5MB</p>
                  </label>
                </div>
              )}
              <div className="mt-2">
                <Label htmlFor="edit-profileImage-url" className="text-gray-500 text-xs">O ingresa una URL (opcional)</Label>
                <Input
                  id="edit-profileImage-url"
                  value={editBarberForm.profileImage}
                  onChange={(e) => {
                    setEditBarberForm({ ...editBarberForm, profileImage: e.target.value });
                    setEditPreviewImage(e.target.value);
                  }}
                  placeholder="https://i.pinimg.com/474x/1a/8a/d8/1a8ad8a81299dd60695edcd51aa0e592.jpg"
                  className="bg-[#0a0a0a] border-gray-700 text-white text-xs"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editBarberForm.isActive}
                onChange={(e) => setEditBarberForm({ ...editBarberForm, isActive: e.target.checked })}
                className="w-4 h-4 text-[#00f0ff] bg-[#0a0a0a] border-gray-700 rounded focus:ring-[#00f0ff]"
              />
              <Label htmlFor="edit-isActive" className="text-gray-300">Barbero activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="border-gray-700 text-gray-300"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditBarber}
              className="bg-gradient-to-r from-[#00f0ff] to-[#0099cc] text-black hover:opacity-90"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Barber Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">¿Desactivar barbero?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              ¿Estás seguro de que deseas desactivar a {selectedBarber?.user?.name}? 
              El barbero no será eliminado permanentemente, solo se marcará como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300" disabled={submitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBarber}
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={submitting}
            >
              {submitting ? 'Desactivando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
