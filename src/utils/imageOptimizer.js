/**
 * Ultra-Premium Client-Side Product Image Optimizer
 * Converts raw camera/desktop uploads (PNG/JPG/WEBP/SVG) into studio-grade,
 * lightweight WebP/JPEG assets with selectable framing modes and telemetry.
 */

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function estimateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64Index = dataUrl.indexOf(',');
  if (base64Index === -1) return dataUrl.length;
  const base64Length = dataUrl.length - (base64Index + 1);
  return Math.round((base64Length * 3) / 4);
}

/**
 * Optimize an image File or Blob or DataURL using HTML5 Canvas
 * @param {File|Blob|string} source - Input File, Blob, or dataURL/image URL
 * @param {Object} options
 * @param {'studio'|'contain'|'cover'} options.mode - 'studio' (800x800 white pad), 'contain' (preserve aspect ratio), 'cover' (800x800 center crop)
 * @param {number} options.maxDimension - Max width/height (default 800)
 * @param {number} options.quality - Compression quality 0..1 (default 0.86)
 * @returns {Promise<{dataUrl: string, width: number, height: number, originalBytes: number, optimizedBytes: number, savingsPercent: number, format: string}>}
 */
export function optimizeProductImage(source, options = {}) {
  const {
    mode = 'studio',
    maxDimension = 800,
    quality = 0.86
  } = options;

  return new Promise((resolve, reject) => {
    const processDataUrl = (rawDataUrl, originalBytes, mimeType = '') => {
      // Keep vector SVGs intact
      if (mimeType === 'image/svg+xml' || rawDataUrl.startsWith('data:image/svg+xml')) {
        const bytes = originalBytes || estimateDataUrlBytes(rawDataUrl);
        resolve({
          dataUrl: rawDataUrl,
          width: maxDimension,
          height: maxDimension,
          originalBytes: bytes,
          optimizedBytes: bytes,
          savingsPercent: 0,
          format: 'SVG'
        });
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const srcW = img.naturalWidth || img.width || 800;
          const srcH = img.naturalHeight || img.height || 800;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (mode === 'studio') {
            // Uniform 800x800 studio square with clean white background and 6% padding
            const targetSize = maxDimension;
            canvas.width = targetSize;
            canvas.height = targetSize;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetSize, targetSize);

            const pad = Math.round(targetSize * 0.06);
            const availW = targetSize - pad * 2;
            const availH = targetSize - pad * 2;

            const scale = Math.min(availW / srcW, availH / srcH);
            const drawW = Math.round(srcW * scale);
            const drawH = Math.round(srcH * scale);
            const offsetX = Math.round((targetSize - drawW) / 2);
            const offsetY = Math.round((targetSize - drawH) / 2);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
          } else if (mode === 'cover') {
            // 800x800 1:1 center crop
            const targetSize = maxDimension;
            canvas.width = targetSize;
            canvas.height = targetSize;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetSize, targetSize);

            const scale = Math.max(targetSize / srcW, targetSize / srcH);
            const drawW = Math.round(srcW * scale);
            const drawH = Math.round(srcH * scale);
            const offsetX = Math.round((targetSize - drawW) / 2);
            const offsetY = Math.round((targetSize - drawH) / 2);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
          } else {
            // 'contain' — preserve exact aspect ratio up to maxDimension
            let targetW = srcW;
            let targetH = srcH;
            if (targetW > maxDimension || targetH > maxDimension) {
              if (targetW > targetH) {
                targetH = Math.round((targetH * maxDimension) / targetW);
                targetW = maxDimension;
              } else {
                targetW = Math.round((targetW * maxDimension) / targetH);
                targetH = maxDimension;
              }
            }
            canvas.width = targetW;
            canvas.height = targetH;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetW, targetH);
          }

          // Prefer WebP for maximum compression + crispness, fallback to JPEG
          let outputDataUrl = canvas.toDataURL('image/webp', quality);
          let format = 'WEBP';
          if (!outputDataUrl.startsWith('data:image/webp')) {
            outputDataUrl = canvas.toDataURL('image/jpeg', quality);
            format = 'JPG';
          }

          const optimizedBytes = estimateDataUrlBytes(outputDataUrl);
          const orig = originalBytes || optimizedBytes;
          const savingsPercent = orig > optimizedBytes
            ? Math.round(((orig - optimizedBytes) / orig) * 100)
            : 0;

          resolve({
            dataUrl: outputDataUrl,
            width: canvas.width,
            height: canvas.height,
            originalBytes: orig,
            optimizedBytes,
            savingsPercent,
            format
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to decode image for optimization.'));
      };

      img.src = rawDataUrl;
    };

    if (typeof source === 'string') {
      processDataUrl(source, estimateDataUrlBytes(source));
      return;
    }

    if (source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processDataUrl(e.target.result, source.size, source.type);
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(source);
      return;
    }

    reject(new Error('Unsupported image source'));
  });
}
