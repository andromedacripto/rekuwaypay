'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'

interface QrScannerModalProps {
  onResult: (text: string) => void
  onClose: () => void
}

export function QrScannerModal({ onResult, onClose }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let stopped = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setScanning(true)
          tick()
        }
      } catch {
        setError('Câmera não disponível. Permite o acesso nas configurações do navegador.')
      }
    }

    async function tick() {
      if (stopped) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0)

      try {
        // Use native BarcodeDetector if available (Chrome/Android)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const BD = (window as any).BarcodeDetector
        if (BD) {
          const detector = new BD({ formats: ['qr_code'] })
          const barcodes = await detector.detect(canvas)
          if (barcodes.length > 0) {
            stop()
            onResult(barcodes[0].rawValue as string)
            return
          }
        } else {
          // Fallback: zxing (lazy-load)
          const { BrowserQRCodeReader } = await import('@zxing/library')
          const reader = new BrowserQRCodeReader()
          const imageData = canvas.toDataURL('image/png')
          const img = new Image()
          img.src = imageData
          await new Promise<void>((res) => {
            img.onload = () => res()
          })
          try {
            const result = await reader.decodeFromImageElement(img)
            if (result) {
              stop()
              onResult(result.getText())
              return
            }
          } catch {
            // no qr found in this frame, keep scanning
          }
        }
      } catch {
        // keep scanning
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    function stop() {
      stopped = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }

    void start()

    return () => {
      stopped = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Camera className="size-5 text-white" />
          <span className="text-sm font-semibold text-white">Escanear QR Code</span>
        </div>
        <button
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <X className="size-5 text-white" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <AlertCircle className="size-10 text-red-400" />
            <p className="text-sm text-white/80">{error}</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />

            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-64">
                {/* Corner brackets */}
                {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                  <span
                    key={corner}
                    className="absolute size-8 border-white"
                    style={{
                      borderTopWidth: corner.startsWith('t') ? 3 : 0,
                      borderBottomWidth: corner.startsWith('b') ? 3 : 0,
                      borderLeftWidth: corner.endsWith('l') ? 3 : 0,
                      borderRightWidth: corner.endsWith('r') ? 3 : 0,
                      top: corner.startsWith('t') ? 0 : 'auto',
                      bottom: corner.startsWith('b') ? 0 : 'auto',
                      left: corner.endsWith('l') ? 0 : 'auto',
                      right: corner.endsWith('r') ? 0 : 'auto',
                      borderRadius:
                        corner === 'tl'
                          ? '8px 0 0 0'
                          : corner === 'tr'
                            ? '0 8px 0 0'
                            : corner === 'bl'
                              ? '0 0 0 8px'
                              : '0 0 8px 0',
                    }}
                  />
                ))}

                {/* Scan line animation */}
                {scanning && (
                  <div
                    className="absolute left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
                      animation: 'scanline 2s linear infinite',
                      top: '50%',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Dark vignette around frame */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 280px 280px at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </>
        )}
      </div>

      <p className="pb-10 pt-4 text-center text-xs text-white/50">
        Aponte a câmera para o QR Code de pagamento
      </p>

      {/* Scanline animation keyframes */}
      <style>{`
        @keyframes scanline {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>

      {/* Hidden canvas for frame processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
