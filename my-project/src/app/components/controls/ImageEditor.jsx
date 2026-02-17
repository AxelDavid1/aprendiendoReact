import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ImageEditor.module.css';

// Helper function
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const ImageEditor = ({
  imageUrl,
  onCropComplete,
  onCancel,
  cropWidth = 240,
  cropHeight = 160,
  initialAdjustments = null // Ajustes iniciales {x, y, scale}
}) => {
  /* ── image natural dimensions ─────────────────────────────── */
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  /* ── base rendered size (at scale = 1 the image "covers" the crop area) */
  const [baseW, setBaseW] = useState(0);
  const [baseH, setBaseH] = useState(0);

  /* ── container dimensions (from ResizeObserver) ───────────── */
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);

  /* ── transform: image drawn at (tx,ty) with size baseW*scale x baseH*scale */
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const scaleRef = useRef(1);
  const [, forceRender] = useState(0);
  const rerender = () => forceRender((n) => n + 1);

  const setTransform = (x, y, s) => {
    txRef.current = x;
    tyRef.current = y;
    scaleRef.current = s;
    rerender();
  };

  /* ── drag ──────────────────────────────────────────────────── */
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  /* ── confirmed flag: once true, all interaction is frozen ── */
  const [confirmed, setConfirmed] = useState(false);
  const confirmedRef = useRef(false);
  useEffect(() => { confirmedRef.current = confirmed; }, [confirmed]);

  /* ── pinch ─────────────────────────────────────────────────── */
  const ptrs = useRef(new Map());
  const pinchDist0 = useRef(0);
  const pinchScale0 = useRef(1);

  const containerRef = useRef(null);
  const loaded = useRef(false);
  const baseRef = useRef({ w: 0, h: 0 });

  /* ── crop frame (always centred) ──────────────────────────── */
  const cropLeft = (containerW - cropWidth) / 2;
  const cropTop = (containerH - cropHeight) / 2;

  /* ── observe container ────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerW(e.contentRect.width);
        setContainerH(e.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── constrain: image must always cover the crop rect ─────── */
  const constrain = useCallback(
    (x, y, s, bw, bh, cW, cH) => {
      if (bw === 0 || bh === 0 || cW === 0) return { x, y };
      const imgW = bw * s;
      const imgH = bh * s;
      const cL = (cW - cropWidth) / 2;
      const cT = (cH - cropHeight) / 2;
      const cR = cL + cropWidth;
      const cB = cT + cropHeight;

      let nx, ny;
      if (imgW < cropWidth) {
        nx = cL + (cropWidth - imgW) / 2;
      } else {
        nx = clamp(x, cR - imgW, cL);
      }
      if (imgH < cropHeight) {
        ny = cT + (cropHeight - imgH) / 2;
      } else {
        ny = clamp(y, cB - imgH, cT);
      }
      return { x: nx, y: ny };
    },
    [cropWidth, cropHeight]
  );

  /* ── fit initial ──────────────────────────────────────────── */
  const fitInitial = useCallback(
    (nw, nh, cW, cH) => {
      if (cW === 0 || cH === 0 || nw === 0 || nh === 0) return;
      const sx = cropWidth / nw;
      const sy = cropHeight / nh;
      const cover = Math.max(sx, sy);
      const bw = nw * cover;
      const bh = nh * cover;
      setBaseW(bw);
      setBaseH(bh);
      baseRef.current = { w: bw, h: bh };

      const cL = (cW - cropWidth) / 2;
      const cT = (cH - cropHeight) / 2;
      const ix = cL + (cropWidth - bw) / 2;
      const iy = cT + (cropHeight - bh) / 2;
      setTransform(ix, iy, 1);
    },
    [cropWidth, cropHeight]
  );

  // Re-fit on container resize
  useEffect(() => {
    if (loaded.current && naturalW > 0 && containerW > 0) {
      fitInitial(naturalW, naturalH, containerW, containerH);
    }
  }, [containerW, containerH, naturalW, naturalH, fitInitial]);

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
    loaded.current = true;
    
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el) {
        // Primero ajustar inicialmente
        fitInitial(img.naturalWidth, img.naturalHeight, el.clientWidth, el.clientHeight);
        
        // Luego aplicar ajustes guardados si existen
        if (initialAdjustments) {
          console.log('🔄 Aplicando ajustes iniciales:', initialAdjustments);
          
          const { x = 0, y = 0, scale = 1 } = initialAdjustments;
          
          // Aplicar transformación con ajustes guardados
          const cL = (el.clientWidth - cropWidth) / 2;
          const cT = (el.clientHeight - cropHeight) / 2;
          const ix = cL + (cropWidth - baseRef.current.w * scale) / 2 + x;
          const iy = cT + (cropHeight - baseRef.current.h * scale) / 2 + y;
          
          setTransform(ix, iy, scale);
        }
      }
    });
  };

  /* ── apply zoom toward a point ────────────────────────────── */
  const applyZoom = useCallback(
    (newScale, cx, cy) => {
      const oldScale = scaleRef.current;
      const oldTx = txRef.current;
      const oldTy = tyRef.current;
      const bw = baseRef.current.w;
      const bh = baseRef.current.h;

      const imgX = (cx - oldTx) / oldScale;
      const imgY = (cy - oldTy) / oldScale;

      let nx = cx - imgX * newScale;
      let ny = cy - imgY * newScale;

      const el = containerRef.current;
      const cW = el?.clientWidth ?? 0;
      const cH = el?.clientHeight ?? 0;

      const c = constrain(nx, ny, newScale, bw, bh, cW, cH);
      setTransform(c.x, c.y, newScale);
    },
    [constrain]
  );

  /* ── pointer events (unified mouse + touch) ───────────────── */
  const handlePointerDown = (e) => {
    if (confirmed) return;

    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (ptrs.current.size === 1) {
      setDragging(true);
      dragOrigin.current = {
        x: e.clientX,
        y: e.clientY,
        tx: txRef.current,
        ty: tyRef.current,
      };
    } else if (ptrs.current.size === 2) {
      setDragging(false);
      const pts = Array.from(ptrs.current.values());
      pinchDist0.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchScale0.current = scaleRef.current;
    }
  };

  const handlePointerMove = (e) => {
    if (confirmed) return;
    if (ptrs.current.size === 0) return;
    if (!ptrs.current.has(e.pointerId)) return;

    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrs.current.size === 2) {
      const pts = Array.from(ptrs.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchDist0.current > 0) {
        const ns = clamp(pinchScale0.current * (dist / pinchDist0.current), 0.2, 5);
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
        applyZoom(ns, cx, cy);
      }
      return;
    }

    if (!dragging || ptrs.current.size !== 1) return;

    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    const nx = dragOrigin.current.tx + dx;
    const ny = dragOrigin.current.ty + dy;
    const el = containerRef.current;
    const cW = el?.clientWidth ?? 0;
    const cH = el?.clientHeight ?? 0;
    const bw = baseRef.current.w;
    const bh = baseRef.current.h;
    const c = constrain(nx, ny, scaleRef.current, bw, bh, cW, cH);
    txRef.current = c.x;
    tyRef.current = c.y;
    rerender();
  };

  const handlePointerUp = (e) => {
    ptrs.current.delete(e.pointerId);
    // Release capture so the container stops receiving events for this pointer
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }

    if (ptrs.current.size === 0) {
      setDragging(false);
    } else if (ptrs.current.size === 1) {
      const rem = Array.from(ptrs.current.values())[0];
      dragOrigin.current = {
        x: rem.x,
        y: rem.y,
        tx: txRef.current,
        ty: tyRef.current,
      };
      setDragging(true);
    }
  };

  /* ── wheel zoom (attached imperatively for passive:false) ── */
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (confirmedRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const ns = clamp(scaleRef.current * factor, 0.2, 5);
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      applyZoom(ns, cx, cy);
    },
    [applyZoom]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  /* ── zoom buttons ─────────────────────────────────────────── */
  const zoomBy = (factor) => {
    if (confirmed) return;
    const ns = clamp(scaleRef.current * factor, 0.2, 5);
    const el = containerRef.current;
    if (!el) return;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    applyZoom(ns, cx, cy);
  };

  const resetView = () => {
    if (confirmed) return;
    const el = containerRef.current;
    if (el) fitInitial(naturalW, naturalH, el.clientWidth, el.clientHeight);
  };

  const fitToFill = () => {
    if (confirmed) return;
    const bw = baseRef.current.w;
    const bh = baseRef.current.h;
    if (bw === 0) return;
    const ns = clamp(Math.max(cropWidth / bw, cropHeight / bh), 0.2, 5);
    const el = containerRef.current;
    if (!el) return;
    applyZoom(ns, el.clientWidth / 2, el.clientHeight / 2);
  };

  /* ── confirm crop ─────────────────────────────────────────── */
  const handleConfirm = () => {
    console.log('🔍 Debug handleConfirm - Estado inicial:', {
      naturalW, naturalH, baseW, baseH,
      containerW, containerH,
      scaleRef: scaleRef.current,
      txRef: txRef.current,
      tyRef: tyRef.current,
      cropWidth, cropHeight
    });

    if (naturalW === 0 || baseW === 0) {
      console.warn('⚠️ Imagen no cargada completamente');
      alert('Por favor espera a que la imagen se cargue completamente');
      return;
    }

    // Validar que todos los valores sean finitos
    if (!isFinite(naturalW) || !isFinite(naturalH) || 
        !isFinite(baseW) || !isFinite(baseH) ||
        !isFinite(containerW) || !isFinite(containerH) ||
        !isFinite(scaleRef.current) || !isFinite(txRef.current) || !isFinite(tyRef.current)) {
      console.error('❌ Valores de estado inválidos (NaN o Infinity):', {
        naturalW, naturalH, baseW, baseH,
        containerW, containerH,
        scaleRef: scaleRef.current,
        txRef: txRef.current,
        tyRef: tyRef.current
      });
      alert('Error en los valores de la imagen. Por favor recarga la imagen.');
      return;
    }

    // Freeze interaction FIRST so the image cannot move anymore
    setDragging(false);
    ptrs.current.clear();
    setConfirmed(true);

    const s = scaleRef.current;
    const x = txRef.current;
    const y = tyRef.current;
    const imgW = baseW * s;
    const imgH = baseH * s;

    console.log('🔍 Debug handleConfirm - Cálculos intermedios:', {
      s, x, y, imgW, imgH
    });

    const cL = (containerW - cropWidth) / 2;
    const cT = (containerH - cropHeight) / 2;

    console.log('🔍 Debug handleConfirm - Coordenadas de contenedor:', {
      cL, cT, containerW, containerH, cropWidth, cropHeight
    });

    const relX = (cL - x) / imgW;
    const relY = (cT - y) / imgH;
    const relW = cropWidth / imgW;
    const relH = cropHeight / imgH;

    console.log('🔍 Debug handleConfirm - Valores relativos:', {
      relX, relY, relW, relH
    });

    const px = clamp(relX * naturalW, 0, naturalW);
    const py = clamp(relY * naturalH, 0, naturalH);
    const pw = clamp(relW * naturalW, 0, naturalW - px);
    const ph = clamp(relH * naturalH, 0, naturalH - py);

    console.log('🔍 Debug handleConfirm - Valores finales:', {
      px, py, pw, ph,
      naturalW, naturalH
    });

    // Validación final para evitar datos inválidos
    if (px < 0 || py < 0 || pw <= 0 || ph <= 0 || !isFinite(px) || !isFinite(py) || !isFinite(pw) || !isFinite(ph)) {
      console.error('❌ Valores de recorte inválidos:', { px, py, pw, ph, naturalW, naturalH, baseW, baseH });
      setConfirmed(false); // Permitir intentar de nuevo
      alert('Error en los datos de recorte. Por favor intenta de nuevo.');
      return;
    }

    console.log('✅ Datos de recorte válidos:', { px, py, pw, ph });
    
    // Capturar desplazamientos relativos al centro inicial para que sea robusto ante cambios de tamaño de ventana
    const el = containerRef.current;
    if (el) {
      const cL = (el.clientWidth - cropWidth) / 2;
      const cT = (el.clientHeight - cropHeight) / 2;
      const bw = baseRef.current.w;
      const bh = baseRef.current.h;
      const s = scaleRef.current;
      
      // La posición centrada inicial para el scale actual sería:
      const ix = cL + (cropWidth - bw * s) / 2;
      const iy = cT + (cropHeight - bh * s) / 2;
      
      const currentAdjustments = {
        x: Number((txRef.current - ix).toFixed(2)),
        y: Number((tyRef.current - iy).toFixed(2)),
        scale: Number(s.toFixed(4))
      };

      console.log('🚀 Llamando a onCropComplete con:', {
        cropObj: {
          x: Number(px.toFixed(2)),
          y: Number(py.toFixed(2)),
          width: Number(pw.toFixed(2)),
          height: Number(ph.toFixed(2)),
        },
        adjustments: currentAdjustments
      });

      onCropComplete({
        x: Number(px.toFixed(2)),
        y: Number(py.toFixed(2)),
        width: Number(pw.toFixed(2)),
        height: Number(ph.toFixed(2)),
      }, currentAdjustments);
    }
  };

  /* ── derived values for render ────────────────────────────── */
  const tx = txRef.current;
  const ty = tyRef.current;
  const scale = scaleRef.current;
  const imgDisplayW = baseW * scale;
  const imgDisplayH = baseH * scale;
  const zoomPercent = Math.round(scale * 100);

  return (
    <div className={styles.imageEditorOverlay}>
      <div className={styles.imageEditorModal}>
        <div className={styles.imageEditorHeader}>
          <h3>Ajustar Imagen</h3>
          <div className={styles.imageEditorControls}>
            <button onClick={onCancel} className={styles.btnCancel}>
              Cancelar
            </button>
            <button onClick={handleConfirm} className={styles.btnConfirm} disabled={confirmed}>
              {confirmed ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>

        <div className={styles.imageEditorContent}>
          <div className={styles.imagePreviewContainer}>
            <div
              ref={containerRef}
              className={styles.imageContainer}
              style={{ cursor: confirmed ? 'default' : dragging ? 'grabbing' : 'grab' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Image */}
              {baseW > 0 && (
                <img
                  src={imageUrl}
                  alt="Editor preview"
                  draggable={false}
                  onLoad={handleImageLoad}
                  className={styles.editorImage}
                  style={{
                    width: imgDisplayW,
                    height: imgDisplayH,
                    transform: `translate(${tx}px, ${ty}px)`,
                    willChange: 'transform',
                  }}
                />
              )}
              {/* Hidden loader */}
              {baseW === 0 && (
                <img
                  src={imageUrl}
                  alt=""
                  onLoad={handleImageLoad}
                  className={styles.hiddenLoader}
                />
              )}

              {/* Crop overlay (SVG mask) */}
              {containerW > 0 && (
                <svg
                  className={styles.cropOverlay}
                  width={containerW}
                  height={containerH}
                  viewBox={`0 0 ${containerW} ${containerH}`}
                >
                  <defs>
                    <mask id="crop-mask">
                      <rect width={containerW} height={containerH} fill="white" />
                      <rect
                        x={cropLeft}
                        y={cropTop}
                        width={cropWidth}
                        height={cropHeight}
                        rx={4}
                        fill="black"
                      />
                    </mask>
                  </defs>
                  <rect
                    width={containerW}
                    height={containerH}
                    fill="rgba(0,0,0,0.55)"
                    mask="url(#crop-mask)"
                  />
                  <rect
                    x={cropLeft}
                    y={cropTop}
                    width={cropWidth}
                    height={cropHeight}
                    rx={4}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  {[
                    [cropLeft, cropTop],
                    [cropLeft + cropWidth, cropTop],
                    [cropLeft, cropTop + cropHeight],
                    [cropLeft + cropWidth, cropTop + cropHeight],
                  ].map(([cx, cy], i) => (
                    <rect
                      key={i}
                      x={cx - 5}
                      y={cy - 5}
                      width={10}
                      height={10}
                      rx={2}
                      fill="#3b82f6"
                    />
                  ))}
                  {[1, 2].map((n) => (
                    <React.Fragment key={n}>
                      <line
                        x1={cropLeft + (cropWidth * n) / 3}
                        y1={cropTop}
                        x2={cropLeft + (cropWidth * n) / 3}
                        y2={cropTop + cropHeight}
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={0.5}
                      />
                      <line
                        x1={cropLeft}
                        y1={cropTop + (cropHeight * n) / 3}
                        x2={cropLeft + cropWidth}
                        y2={cropTop + (cropHeight * n) / 3}
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={0.5}
                      />
                    </React.Fragment>
                  ))}
                </svg>
              )}
            </div>
          </div>

          <div className={styles.cropInfo}>
            {/* SECCIÓN CONTROLES - SIEMPRE VISIBLE */}
            <div className={styles.controlsSection}>
              <p className={styles.infoTitle}>Controles</p>
              <div className={styles.controlsCompact}>
                <button
                  onClick={() => zoomBy(1.25)}
                  className={styles.controlIconBtn}
                  disabled={confirmed}
                  title="Acercar imagen (Ctrl +)"
                >
                  <span className={styles.controlIcon}>+</span>
                  <span className={styles.controlLabel}>Acercar</span>
                </button>

                <button
                  onClick={() => zoomBy(1 / 1.25)}
                  className={styles.controlIconBtn}
                  disabled={confirmed}
                  title="Alejar imagen (Ctrl -)"
                >
                  <span className={styles.controlIcon}>-</span>
                  <span className={styles.controlLabel}>Alejar</span>
                </button>

                <button
                  onClick={resetView}
                  className={styles.controlIconBtn}
                  disabled={confirmed}
                  title="Reiniciar posición"
                >
                  <span className={styles.controlIcon}>↻</span>
                  <span className={styles.controlLabel}>Reiniciar</span>
                </button>

                <button
                  onClick={fitToFill}
                  className={styles.controlIconBtn}
                  disabled={confirmed}
                  title="Ajustar al área de recorte"
                >
                  <span className={styles.controlIcon}>⛶</span>
                  <span className={styles.controlLabel}>Ajustar</span>
                </button>
              </div>
            </div>

            {/* SECCIÓN AYUDA - COMPACTA CON TOOLTIPS */}
            <div className={styles.helpSection}>
              <p className={styles.infoTitle}>Ayuda</p>
              <div className={styles.helpCompact}>
                <div className={styles.helpItem} title="">
                  <span className={styles.helpIcon}>✋</span>
                  <span className={styles.helpLabel}>Mover</span>
                  <span className={styles.helpTooltip}>Arrastra para mover la imagen</span>
                </div>

                <div className={styles.helpItem} title="">
                  <span className={styles.helpIcon}>🔍</span>
                  <span className={styles.helpLabel}>Zoom</span>
                  <span className={styles.helpTooltip}>Rueda el mouse para zoom</span>
                </div>
              </div>
            </div>

            {/* MENSAJE SIEMPRE VISIBLE */}
            <div className={styles.blueHint}>
              <span className={styles.blueDot}>🔵</span>
              <span>El área azul es el resultado final</span>
            </div>

            {/* SECCIÓN INFORMACIÓN - AL FINAL */}
            <div className={styles.infoSection}>
              <p className={styles.infoTitle}>Información</p>
              <div className={styles.infoCompact}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Original</span>
                  <span className={styles.infoValue}>{naturalW} x {naturalH}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Recorte</span>
                  <span className={styles.infoValue}>{cropWidth} x {cropHeight}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Zoom</span>
                  <span className={styles.infoValue}>{zoomPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
