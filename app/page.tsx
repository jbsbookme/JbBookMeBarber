"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};

  // Si está autenticado, redirigir al dashboard correspondiente
  if (status === "authenticated" && session) {
    if (session.user?.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (session.user?.role === "BARBER") {
      router.push("/dashboard/barbero");
    } else {
      router.push("/dashboard/cliente");
    }
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Video de fondo a pantalla completa */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/intro-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo animado */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ffd700] p-1 shadow-[0_0_50px_rgba(0,240,255,0.8)]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#ffd700] bg-clip-text text-transparent">
                BM
              </span>
            </div>
          </div>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#00f0ff] via-[#ffd700] to-[#00f0ff] bg-clip-text text-transparent"
        >
          BookMe
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-300 mb-16 max-w-2xl mx-auto font-light"
        >
          La mejor experiencia en cuidado personal
        </motion.p>

        {/* Botón "Entrar" con animación */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="group relative px-12 py-8 text-2xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#ffd700] text-black hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              ENTRAR
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
              }}
            />
          </Button>
        </motion.div>

        {/* Texto decorativo inferior */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 text-sm text-gray-500"
        >
          Presiona para comenzar tu experiencia
        </motion.p>
      </div>
    </div>
  );
}