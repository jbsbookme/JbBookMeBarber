'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Botón Volver */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-[#00f0ff]" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Política de <span className="bg-gradient-to-r from-[#00f0ff] to-[#ffd700] text-transparent bg-clip-text">Privacidad</span>
          </h1>
          <p className="text-gray-400">Última actualización: Diciembre 2024</p>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Introducción */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
              <p className="text-gray-300 leading-relaxed">
                En <span className="text-[#00f0ff] font-semibold">BookMe</span>, nos comprometemos a proteger tu privacidad y manejar tus datos personales de manera responsable. Esta política describe cómo recopilamos, usamos y protegemos tu información.
              </p>
            </CardContent>
          </Card>

          {/* Información que Recopilamos */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="mr-2 h-5 w-5 text-[#00f0ff]" />
                Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Información Personal:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nombre completo y fotografía de perfil</li>
                  <li>Correo electrónico y número de teléfono</li>
                  <li>Información de cuenta (contraseña encriptada)</li>
                  <li>Historial de citas y servicios solicitados</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Información de Uso:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Preferencias de servicios y barberos</li>
                  <li>Reseñas y calificaciones</li>
                  <li>Interacciones con nuestro asistente virtual</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cómo Usamos tu Información */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="mr-2 h-5 w-5 text-[#ffd700]" />
                Cómo Usamos tu Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              <p>Utilizamos tu información para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Procesar y gestionar tus reservas de citas</li>
                <li>Enviar recordatorios y notificaciones importantes</li>
                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                <li>Comunicarnos contigo sobre promociones y novedades (con tu consentimiento)</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </CardContent>
          </Card>

          {/* Protección de Datos */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="mr-2 h-5 w-5 text-[#00f0ff]" />
                Protección de tus Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              <p>Implementamos medidas de seguridad para proteger tu información:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encriptación de contraseñas con algoritmos seguros (bcrypt)</li>
                <li>Conexiones seguras mediante HTTPS/SSL</li>
                <li>Acceso limitado a datos personales solo para personal autorizado</li>
                <li>Auditorías de seguridad periódicas</li>
                <li>Respaldos regulares de información</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartir Información */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-[#ffd700]" />
                Compartir Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              <p><strong className="text-white">NO vendemos</strong> tu información personal a terceros.</p>
              <p>Compartimos información únicamente cuando:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Es necesario para procesar tu solicitud (ej: asignar cita con un barbero)</li>
                <li>Lo requiere la ley o autoridades competentes</li>
                <li>Has dado tu consentimiento explícito</li>
                <li>Es necesario para proteger nuestros derechos legales</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tus Derechos */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="mr-2 h-5 w-5 text-[#00f0ff]" />
                Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              <p>Tienes derecho a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Acceder a tu información personal</li>
                <li>Rectificar datos incorrectos o desactualizados</li>
                <li>Solicitar la eliminación de tu cuenta y datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
                <li>Solicitar la portabilidad de tus datos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies y Tecnologías Similares */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>Utilizamos cookies y tecnologías similares para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Mantener tu sesión iniciada</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de nuestro sitio</li>
                <li>Mejorar la funcionalidad y rendimiento</li>
              </ul>
              <p className="mt-4">Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.</p>
            </CardContent>
          </Card>

          {/* Menores de Edad */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos para eliminarla.</p>
            </CardContent>
          </Card>

          {/* Cambios a esta Política */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos mediante:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Un aviso destacado en nuestro sitio web</li>
                <li>Un correo electrónico a tu dirección registrada</li>
              </ul>
              <p className="mt-4">Te recomendamos revisar esta página regularmente para estar informado sobre cómo protegemos tu información.</p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border-[#00f0ff]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="mr-2 h-5 w-5 text-[#00f0ff]" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p className="mb-4">Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, contáctanos:</p>
              <div className="space-y-2 bg-black/30 p-4 rounded-lg">
                <p>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacidad@barberiapremium.com" className="text-[#00f0ff] hover:underline">
                    privacidad@barberiapremium.com
                  </a>
                </p>
                <p>
                  <strong className="text-white">Teléfono:</strong>{' '}
                  <a href="tel:+15551234567" className="text-[#00f0ff] hover:underline">
                    +1 (555) 123-4567
                  </a>
                </p>
                <p>
                  <strong className="text-white">Dirección:</strong> 123 Main Street, Suite 100, Ciudad
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-sm text-gray-500">
            Al usar nuestros servicios, aceptas esta política de privacidad
          </p>
          <Link href="/auth">
            <Button
              variant="link"
              className="text-[#00f0ff] hover:text-[#00d5e6] mt-2"
            >
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
