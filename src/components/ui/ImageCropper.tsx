// ImageCropper — Touch-friendly pan+zoom image cropper modal
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Maximize, Square, RectangleHorizontal, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  fileName?: string;
}

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9';

export default function ImageCropper({ src, onCrop, onCancel, fileName = 'cropped.jpg' }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState<AspectRatio>('free');
  const [isCropping, setIsCropping] = useState(false);

  // Dragging state
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Reset transforms
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src]);

  // Get crop frame dimensions based on aspect ratio
  const getCropFrame = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0, w: 300, h: 300 };
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const pad = 24;
    const maxW = cw - pad * 2;
    const maxH = ch - pad * 2;

    let fw: number, fh: number;

    if (aspect === '1:1') {
      fw = fh = Math.min(maxW, maxH);
    } else if (aspect === '4:3') {
      fw = maxW;
      fh = fw * 3 / 4;
      if (fh > maxH) { fh = maxH; fw = fh * 4 / 3; }
    } else if (aspect === '16:9') {
      fw = maxW;
      fh = fw * 9 / 16;
      if (fh > maxH) { fh = maxH; fw = fh * 16 / 9; }
    } else {
      // Free — use full available space
      fw = maxW;
      fh = maxH;
    }

    return {
      x: (cw - fw) / 2,
      y: (ch - fh) / 2,
      w: fw,
      h: fh,
    };
  }, [aspect]);

  // Draw image onto visible canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !containerRef.current) return;

    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);

    // Fit image to container initially
    const fitScale = Math.min(cw / img.width, ch / img.height);
    const drawW = img.width * fitScale * scale;
    const drawH = img.height * fitScale * scale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Draw darkened overlay outside crop frame
    const frame = getCropFrame();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // Top
    ctx.fillRect(0, 0, cw, frame.y);
    // Bottom
    ctx.fillRect(0, frame.y + frame.h, cw, ch - frame.y - frame.h);
    // Left
    ctx.fillRect(0, frame.y, frame.x, frame.h);
    // Right
    ctx.fillRect(frame.x + frame.w, frame.y, cw - frame.x - frame.w, frame.h);

    // Crop frame border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const gx = frame.x + (frame.w * i) / 3;
      const gy = frame.y + (frame.h * i) / 3;
      ctx.beginPath(); ctx.moveTo(gx, frame.y); ctx.lineTo(gx, frame.y + frame.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(frame.x, gy); ctx.lineTo(frame.x + frame.w, gy); ctx.stroke();
    }
  }, [scale, offset, getCropFrame]);

  useEffect(() => {
    if (imgLoaded) draw();
  }, [imgLoaded, draw]);

  // Pointer handlers for pan
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Zoom with buttons
  const zoomIn = () => setScale(s => Math.min(5, s + 0.15));
  const zoomOut = () => setScale(s => Math.max(0.3, s - 0.15));
  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  // Touch pinch zoom
  const lastTouchDist = useRef<number | null>(null);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) {
        const delta = (dist - lastTouchDist.current) * 0.005;
        setScale(s => Math.min(5, Math.max(0.3, s + delta)));
      }
      lastTouchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // Perform the crop
  const handleCrop = async () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    setIsCropping(true);

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const frame = getCropFrame();

    // Calculate where the image is on the display canvas
    const fitScale = Math.min(cw / img.width, ch / img.height);
    const drawW = img.width * fitScale * scale;
    const drawH = img.height * fitScale * scale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    // Map frame coordinates back to original image coordinates
    const srcX = (frame.x - drawX) / (fitScale * scale);
    const srcY = (frame.y - drawY) / (fitScale * scale);
    const srcW = frame.w / (fitScale * scale);
    const srcH = frame.h / (fitScale * scale);

    // Clamp to image bounds
    const cx = Math.max(0, srcX);
    const cy = Math.max(0, srcY);
    const cWidth = Math.min(img.width - cx, srcW - (cx - srcX));
    const cHeight = Math.min(img.height - cy, srcH - (cy - srcY));

    // Draw cropped result
    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.max(1, Math.round(cWidth));
    outCanvas.height = Math.max(1, Math.round(cHeight));
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) { setIsCropping(false); return; }

    outCtx.drawImage(img, cx, cy, cWidth, cHeight, 0, 0, outCanvas.width, outCanvas.height);

    outCanvas.toBlob((blob) => {
      if (blob) {
        const ext = fileName.split('.').pop() || 'jpg';
        const croppedFile = new File([blob], `cropped-${Date.now()}.${ext}`, { type: blob.type });
        onCrop(croppedFile);
      }
      setIsCropping(false);
    }, 'image/jpeg', 0.92);
  };

  const aspects: { key: AspectRatio; label: string; icon: any }[] = [
    { key: 'free', label: 'Free', icon: Maximize },
    { key: '1:1', label: '1:1', icon: Square },
    { key: '4:3', label: '4:3', icon: RectangleHorizontal },
    { key: '16:9', label: '16:9', icon: RectangleHorizontal },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/10 shrink-0">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-white font-semibold text-sm">Crop Image</h2>
        <button
          onClick={handleCrop}
          disabled={isCropping}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--emerald,#16a34a)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isCropping ? <span className="animate-spin">⏳</span> : <Check size={18} />}
          Done
        </button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0">
        {/* Aspect ratio selector */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {aspects.map(a => (
            <button
              key={a.key}
              onClick={() => setAspect(a.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                aspect === a.key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <a.icon size={14} />
              {a.label}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={zoomOut} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ZoomOut size={20} />
          </button>
          <span className="text-white/60 text-xs font-mono min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ZoomIn size={20} />
          </button>
          <button onClick={resetView} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors ml-2">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
