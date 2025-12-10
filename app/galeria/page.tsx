'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface GalleryItem {
  id: string
  type: 'image'
  src: string
  title: string
  description: string | null
}

export default function GaleriaPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        const formattedItems: GalleryItem[] = data.map((img: any) => ({
          id: img.id,
          type: 'image' as const,
          src: img.imageUrl,
          title: img.title,
          description: img.description
        }))
        setGalleryItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400">Cargando galería...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-[#00f0ff] hover:bg-transparent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Galería</h1>
            </div>
          </div>
          <p className="text-gray-400">Descubre nuestro trabajo y ambiente</p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        {galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No hay imágenes en la galería por el momento</p>
            <p className="text-gray-500 mt-2">Vuelve pronto para ver nuestro trabajo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer overflow-hidden bg-gray-900 border-gray-800 hover:border-cyan-500 transition-all duration-300"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-video bg-gray-800">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setSelectedItem(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={selectedItem.src}
                alt={selectedItem.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
              <p className="text-gray-400">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
