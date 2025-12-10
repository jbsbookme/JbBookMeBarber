import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { generateQRCode } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const barberId = searchParams.get('barberId');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    let url: string;

    if (type === 'barber' && barberId) {
      url = `${baseUrl}/barberos/${barberId}`;
    } else {
      url = baseUrl;
    }

    const qrCode = await generateQRCode(url);

    return NextResponse.json({ qrCode, url });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Error al generar código QR' }, { status: 500 });
  }
}
