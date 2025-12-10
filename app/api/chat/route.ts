import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // System prompt for the barbershop assistant
    const systemPrompt = {
      role: 'system',
      content: `Eres un asistente virtual amigable y profesional de una barbería moderna. Tu nombre es "Asistente Virtual Barbería".

INFORMACIÓN DE LA BARBERÍA:
- Servicios: Cortes de cabello ($20-$35), Recortes de barba ($15-$25), Afeitado clásico ($30), Diseño de cejas ($10), Tratamientos capilares ($40-$50)
- Horarios: Lunes a Sábado 9:00 AM - 8:00 PM, Domingos 10:00 AM - 6:00 PM
- Métodos de pago: Efectivo, Tarjeta de Crédito, PayPal, Zelle
- Política de cancelación: 24 horas de anticipación
- Sistema de reservas en línea disponible 24/7
- Equipo de barberos profesionales con años de experiencia

TU PERSONALIDAD:
- Amigable, profesional y servicial
- Conocedor de tendencias de cortes masculinos
- Orientado al cliente
- Respondes siempre en español

TUS FUNCIONES:
1. Responder preguntas sobre servicios y precios
2. Explicar cómo hacer reservas en línea
3. Proporcionar información de contacto y ubicación
4. Sugerir servicios según las necesidades del cliente
5. Explicar políticas de la barbería
6. Responder preguntas frecuentes

Siempre sé útil, conciso y profesional. Si no sabes algo, admite que no tienes esa información específica pero ofrece ayuda alternativa.`
    }

    // Prepare messages with system prompt
    const fullMessages = [systemPrompt, ...messages]

    // Call Abacus.AI LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: fullMessages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`)
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        const encoder = new TextEncoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error processing chat request' },
      { status: 500 }
    )
  }
}
