import React, { useState, useRef, useEffect } from 'react';
import ImageEditor from './ImageEditor';
import styles from './DualImageInput.module.css';

const DualImageInput = ({ 
  value, 
  onChange, 
  onImageProcessed,
  originalImageUrl = '', // Nueva prop para imagen original
  initialAdjustments = null, // Nueva prop para ajustes
  uploadType = 'cursos', // 'cursos' o 'credenciales'
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false
}) => {
  const [originalFile, setOriginalFile] = useState(null); // Archivo original (File object)
  const [originalImage, setOriginalImage] = useState(''); // Data URL para el editor
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [showEditor, setShowEditor] = useState(false);
  const [editorImage, setEditorImage] = useState('');
  const [serverOriginalUrl, setServerOriginalUrl] = useState(originalImageUrl || ''); // URL de original guardada en servidor
  const [savedAdjustments, setSavedAdjustments] = useState(initialAdjustments); // Ajustes guardados
  const fileInputRef = useRef(null);

  // Sincronizar previewUrl con el valor externo y cargar imagen original si existe
  useEffect(() => {
    if (value !== undefined) {
      setPreviewUrl(value || '');
      // IMPORTANTE: No asumir que value es la imagen original
      // Podría ser la imagen recortada, necesitamos la original por separado
      if (value && !originalImage && !serverOriginalUrl) {
        console.log('🔄 Valor externo detectado, pero necesitamos la imagen original por separado');
        // No establecemos originalImage aquí porque podría ser la recortada
      }
    }
  }, [value, originalImage, serverOriginalUrl]);

  // Sincronizar con props cuando cambian
  useEffect(() => {
    if (originalImageUrl) setServerOriginalUrl(originalImageUrl);
    if (initialAdjustments) setSavedAdjustments(initialAdjustments);
  }, [originalImageUrl, initialAdjustments]);

  // Cargar ajustes guardados cuando el componente se inicializa con datos existentes
  useEffect(() => {
    console.log('📊 Componente inicializado con:', { 
      previewUrl: previewUrl ? 'presente' : 'ausente',
      serverOriginalUrl: serverOriginalUrl || originalImageUrl ? 'presente' : 'ausente',
      savedAdjustments: savedAdjustments || initialAdjustments ? 'presentes' : 'ausentes'
    });
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setOriginalFile(file); // GUARDAR OBJETO FILE

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPreviewUrl(result);
      setEditorImage(result);
      setOriginalImage(result); // GUARDAR DATA URL PARA EDITOR
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!previewUrl) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!previewUrl) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handlePaste = (e) => {
    if (!previewUrl) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          handleFileSelect(file);
          break;
        }
      }
    }
  };

  const handleContainerClick = () => {
    if (!previewUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para recortar la imagen localmente usando Canvas API
  const cropImageLocally = async (imageUrl, cropData) => {
    console.log('🔍 Debug cropImageLocally - Inicio:', {
      imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : null,
      cropData,
      cropDataKeys: cropData ? Object.keys(cropData) : null
    });

    // Validación previa
    if (!imageUrl) {
      console.error('❌ cropImageLocally - No se proporcionó URL de imagen');
      throw new Error('No se proporcionó URL de imagen');
    }

    // Validación de cropData - permitiendo 0 como valor válido
    if (!cropData || 
        typeof cropData.x !== 'number' || 
        typeof cropData.y !== 'number' || 
        typeof cropData.width !== 'number' || 
        typeof cropData.height !== 'number') {
      
      console.error('❌ cropImageLocally - Datos de recorte inválidos:', {
        cropData,
        cropDataKeys: cropData ? Object.keys(cropData) : 'null/undefined',
        typeofX: typeof cropData?.x,
        typeofY: typeof cropData?.y,
        typeofW: typeof cropData?.width,
        typeofH: typeof cropData?.height
      });
      throw new Error('Datos de recorte inválidos (coordenadas o dimensiones faltantes)');
    }
    
    // Logging para debugging
    console.log('🔄 Iniciando recorte de imagen:', {
      url: imageUrl.substring(0, 50) + '...',
      cropData: cropData
    });
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          console.log('✅ Imagen cargada exitosamente:', {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Configurar el canvas con las dimensiones del recorte
          canvas.width = cropData.width;
          canvas.height = cropData.height;
          
          // Dibujar solo la sección recortada de la imagen
          ctx.drawImage(
            img,
            cropData.x, cropData.y, cropData.width, cropData.height, // Source rectangle
            0, 0, cropData.width, cropData.height // Destination rectangle
          );
          
          // Convertir a blob
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('✅ Imagen recortada exitosamente:', {
                size: blob.size,
                type: blob.type
              });
              resolve(blob);
            } else {
              console.error('❌ Error al convertir canvas a blob');
              reject(new Error('Error al convertir canvas a blob'));
            }
          }, 'image/webp', 0.9);
        } catch (error) {
          console.error('❌ Error en proceso de recorte:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ Error cargando imagen:', {
          url: imageUrl.substring(0, 50) + '...',
          error: error,
          crossOrigin: img.crossOrigin
        });
        reject(new Error(`Error al cargar imagen: ${error.message || 'Error desconocido'}`));
      };
      
      img.src = imageUrl;
    });
  };

  const handleEditorConfirm = async (cropData, adjustments = {}) => {
    console.log('📣 handleEditorConfirm RECIBIDO:', { 
      cropData, 
      adjustments,
      cropDataKeys: cropData ? Object.keys(cropData) : 'null/undefined'
    });
    try {
      // Validar que tengamos imagen para recortar
      const sourceImage = originalImage || serverOriginalUrl;
      if (!sourceImage) {
        throw new Error('No hay imagen para recortar. Por favor sube una nueva imagen.');
      }
      
      console.log('🎯 Confirmando recorte:', {
        type: originalImage ? 'Memoria' : 'Servidor',
        cropData,
        adjustments
      });
      
      // Recortar localmente
      const croppedBlob = await cropImageLocally(sourceImage, cropData);
      
      const formData = new FormData();
      const timestamp = Date.now();
      
      // 1. Imagen Recortada
      formData.append('croppedImage', croppedBlob, `cropped_${timestamp}.webp`);
      
      // 2. Imagen Original
      if (originalFile) {
        // Si es una subida nueva, enviamos el archivo File
        formData.append('originalImage', originalFile);
      } else if (serverOriginalUrl) {
        // Si estamos reajustando, enviamos la URL de la original para que el backend sepa cuál es
        formData.append('originalImageUrl', serverOriginalUrl);
      }

      // 3. Metadatos
      formData.append('adjustments', JSON.stringify(adjustments));
      formData.append('uploadType', uploadType);
      
      // Añadir IDs si existen para actualización directa
      // Nota: DualImageInput no conoce el ID directamente, usualmente se guarda al final.
      // Pero si lo tenemos (ej. en edición), se podría pasar por props.
      
      const endpoint = uploadType === 'cursos' ? '/api/upload/course-image' : '/api/upload/credential-image';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const result = await response.json();
      
      if (result.success) {
        setPreviewUrl(result.imageUrl);
        setServerOriginalUrl(result.originalImageUrl);
        setSavedAdjustments(result.adjustments);
        setOriginalFile(null); // Ya se subió, ahora usamos la URL del servidor
        
        onChange(result.imageUrl);
        
        if (onImageProcessed) {
          // Pasar el objeto completo al padre si lo soporta
          onImageProcessed(result.imageUrl, {
            originalImageUrl: result.originalImageUrl,
            adjustments: result.adjustments
          });
        }
        
        setShowEditor(false);
        setEditorImage('');
      }
    } catch (error) {
      console.error('❌ Error en handleEditorConfirm:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditorImage(''); // Limpiar imagen del editor pero mantener preview
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onChange('');
    setEditorImage('');
    setOriginalFile(null); // Limpiar objeto File
    setOriginalImage(''); // Limpiar imagen original
    setServerOriginalUrl(''); // Limpiar URL del servidor
    setSavedAdjustments(null); // Limpiar ajustes guardados
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const changeImage = (e) => {
    e.stopPropagation();
    // Abrir selector de archivos directamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const adjustImage = async (e) => {
    e.stopPropagation();
    
    console.log('🎯 Iniciando ajuste de imagen:', {
      serverOriginalUrl: serverOriginalUrl ? serverOriginalUrl.substring(0, 50) + '...' : null,
      originalImage: originalImage ? originalImage.substring(0, 50) + '...' : null,
      previewUrl: previewUrl ? previewUrl.substring(0, 50) + '...' : null,
      savedAdjustments: savedAdjustments
    });
    
    // Prioridad 1: Usar original del servidor si existe
    if (serverOriginalUrl) {
      setEditorImage(serverOriginalUrl);
      setShowEditor(true);
      console.log('✅ Usando original del servidor para reajuste:', serverOriginalUrl.substring(0, 50) + '...');
    }
    // Prioridad 2: Usar original en memoria
    else if (originalImage) {
      setEditorImage(originalImage);
      setShowEditor(true);
      console.log('✅ Usando original en memoria para reajuste:', originalImage.substring(0, 50) + '...');
    }
    // Prioridad 3: Usar preview actual (fallback)
    else if (previewUrl) {
      setEditorImage(previewUrl);
      setShowEditor(true);
      console.warn('⚠️ Usando preview como fallback para reajuste:', previewUrl.substring(0, 50) + '...');
    }
    else {
      console.error('❌ No se encontró ninguna imagen para reajustar. Estado actual:', { 
        serverOriginalUrl, 
        originalImage, 
        previewUrl 
      });
      alert('No se encontró la imagen original. Por favor sube una nueva imagen.');
    }
    
    // NOTA: Los ajustes guardados se pasarán al ImageEditor
    // Necesitarás modificar ImageEditor para que acepte y aplique estos ajustes
    if (savedAdjustments) {
      console.log('📊 Ajustes guardados disponibles:', savedAdjustments);
    }
  };

  return (
    <div className={styles.dualImageInput}>
      <div className={styles.uploadHeader}>
        <h3>Subir Imagen</h3>
        <p className={styles.uploadDescription}>
          Arrastra una imagen, haz clic para seleccionar o pega con Ctrl+V
        </p>
      </div>
      
      <div 
        className={`${styles.fileInput} ${isDragging ? styles.dragging : ''} ${previewUrl ? styles.hasPreview : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={handleContainerClick}
        tabIndex="0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className={styles.fileInputNative}
          style={{ display: 'none' }}
        />
        
        {!previewUrl ? (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadIcon}>📁</div>
            <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p className={styles.uploadHint}>O pega una imagen con Ctrl+V</p>
          </div>
        ) : (
          <div className={styles.previewContainer} onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className={styles.preview}
            />
            <div className={styles.previewActions}>
              <button
                type="button"
                onClick={adjustImage}
                className={styles.editButton}
                disabled={disabled}
              >
                ✂️ Ajustar
              </button>
              <button
                type="button"
                onClick={changeImage}
                className={styles.changeButton}
                disabled={disabled}
              >
                🔄 Cambiar
              </button>
              <button
                type="button"
                onClick={removeImage}
                className={styles.removeButton}
                disabled={disabled}
              >
                🗑️ Remover
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditor && (
        <ImageEditor
          imageUrl={editorImage || serverOriginalUrl || originalImage || previewUrl}
          onCropComplete={handleEditorConfirm}
          onCancel={handleEditorCancel}
          aspectRatio={3/2}
          cropWidth={240}
          cropHeight={160}
          initialAdjustments={savedAdjustments}
        />
      )}
    </div>
  );
};

export default DualImageInput;