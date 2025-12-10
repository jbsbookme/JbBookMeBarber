import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { message: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Validar tamaño (5MB máximo)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      );
    }

    // Convertir a buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const timestamp = Date.now();
    const fileName = `profile-${session.user.id}-${timestamp}.${image.type.split('/')[1]}`;

    // En un entorno de producción, aquí subirías a S3, Cloudinary, etc.
    // Por ahora, usaremos una URL base64 para desarrollo
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: base64Image },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: 'Imagen actualizada exitosamente',
      imageUrl: updatedUser.image,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { message: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
