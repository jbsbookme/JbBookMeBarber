import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  sendEmail,
  generate24HourReminderEmail,
  generate2HourReminderEmail,
  generateThankYouEmail,
} from '@/lib/email';
import { AppointmentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Process and send appointment notifications
 * This endpoint checks for appointments that need notifications and sends them
 */
export async function POST() {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    let sentCount = 0;

    // ===== 24-HOUR REMINDERS =====
    // Find appointments that are 24 hours away and haven't been notified yet
    const appointments24h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: in24Hours,
          lte: new Date(in24Hours.getTime() + 60 * 60 * 1000), // Within 1-hour window
        },
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
        },
        notification24hSent: false,
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    for (const appointment of appointments24h) {
      const clientEmail = appointment.client?.email;
      const barberEmail = appointment.barber?.user?.email;
      const clientName = appointment.client?.name || 'Cliente';
      const barberName = appointment.barber?.user?.name || 'Barbero';
      const serviceName = appointment.service?.name || 'Servicio';
      const date = new Date(appointment.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = appointment.time;

      // Send to client
      if (clientEmail) {
        const emailBody = generate24HourReminderEmail(
          clientName,
          barberName,
          serviceName,
          date,
          time
        );
        await sendEmail({
          to: clientEmail,
          subject: '⏰ Recordatorio: Tu cita es mañana',
          body: emailBody,
        });
        sentCount++;
      }

      // Send to barber
      if (barberEmail) {
        const emailBody = generate24HourReminderEmail(
          barberName,
          clientName,
          serviceName,
          date,
          time
        );
        await sendEmail({
          to: barberEmail,
          subject: '⏰ Recordatorio: Cita programada mañana',
          body: emailBody,
        });
        sentCount++;
      }

      // Mark as sent
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { notification24hSent: true },
      });
    }

    // ===== 2-HOUR REMINDERS =====
    // Find appointments that are 2 hours away and haven't been notified yet
    const appointments2h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: in2Hours,
          lte: new Date(in2Hours.getTime() + 30 * 60 * 1000), // Within 30-minute window
        },
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
        },
        notification2hSent: false,
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    for (const appointment of appointments2h) {
      const clientEmail = appointment.client?.email;
      const barberEmail = appointment.barber?.user?.email;
      const clientName = appointment.client?.name || 'Cliente';
      const barberName = appointment.barber?.user?.name || 'Barbero';
      const serviceName = appointment.service?.name || 'Servicio';
      const date = new Date(appointment.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = appointment.time;

      // Send to client
      if (clientEmail) {
        const emailBody = generate2HourReminderEmail(
          clientName,
          barberName,
          serviceName,
          date,
          time
        );
        await sendEmail({
          to: clientEmail,
          subject: '⏰ ¡Tu cita es en 2 horas!',
          body: emailBody,
        });
        sentCount++;
      }

      // Send to barber
      if (barberEmail) {
        const emailBody = generate2HourReminderEmail(
          barberName,
          clientName,
          serviceName,
          date,
          time
        );
        await sendEmail({
          to: barberEmail,
          subject: '⏰ Cita en 2 horas',
          body: emailBody,
        });
        sentCount++;
      }

      // Mark as sent
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { notification2hSent: true },
      });
    }

    // ===== THANK YOU MESSAGES =====
    // Find completed appointments from today that haven't received thank you
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const completedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: now,
        },
        status: AppointmentStatus.COMPLETED,
        thankYouSent: false,
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    for (const appointment of completedAppointments) {
      const clientEmail = appointment.client?.email;
      const clientName = appointment.client?.name || 'Cliente';
      const barberName = appointment.barber?.user?.name || 'Barbero';
      const serviceName = appointment.service?.name || 'Servicio';

      if (clientEmail) {
        const emailBody = generateThankYouEmail(clientName, barberName, serviceName);
        await sendEmail({
          to: clientEmail,
          subject: '💈 ¡Gracias por tu visita!',
          body: emailBody,
        });
        sentCount++;

        // Mark as sent
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { thankYouSent: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesadas exitosamente ${sentCount} notificaciones`,
      details: {
        reminders24h: appointments24h.length,
        reminders2h: appointments2h.length,
        thankYou: completedAppointments.length,
      },
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { error: 'Error al procesar notificaciones' },
      { status: 500 }
    );
  }
}
