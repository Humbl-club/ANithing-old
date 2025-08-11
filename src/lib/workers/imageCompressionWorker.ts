/**
 * Image Compression Web Worker
 * Performs CPU-intensive image compression off the main thread
 */

interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

interface WorkerMessage {
  imageData: ArrayBuffer;
  options: CompressionOptions;
}

interface WorkerResponse {
  compressedImage?: Blob;
  error?: string;
  compressionRatio?: number;
  originalSize?: number;
  compressedSize?: number;
}

// Handle messages from main thread
self.onmessage = async function(event: MessageEvent<WorkerMessage>) {
  const { imageData, options } = event.data;
  
  try {
    const result = await compressImage(imageData, options);
    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Unknown compression error'
    } as WorkerResponse);
  }
};

/**
 * Compress image data
 */
async function compressImage(
  imageData: ArrayBuffer, 
  options: CompressionOptions
): Promise<WorkerResponse> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp'
  } = options;

  // Create image from array buffer
  const blob = new Blob([imageData]);
  const imageBitmap = await createImageBitmap(blob);
  
  const originalSize = imageData.byteLength;
  
  // Calculate target dimensions maintaining aspect ratio
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    imageBitmap.width,
    imageBitmap.height,
    maxWidth,
    maxHeight
  );

  // Create canvas for compression
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Configure canvas for quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw and compress image
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
  
  // Convert to blob with compression
  const mimeType = getMimeType(format);
  const compressedBlob = await canvas.convertToBlob({
    type: mimeType,
    quality: quality
  });

  const compressedSize = compressedBlob.size;
  const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

  // Clean up
  imageBitmap.close();

  return {
    compressedImage: compressedBlob,
    compressionRatio,
    originalSize,
    compressedSize
  };
}

/**
 * Calculate target dimensions maintaining aspect ratio
 */
function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If image is smaller than limits, return original dimensions
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  
  let targetWidth = maxWidth;
  let targetHeight = maxWidth / aspectRatio;
  
  // If height exceeds limit, scale by height instead
  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = maxHeight * aspectRatio;
  }
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  };
}

/**
 * Get MIME type for format
 */
function getMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    case 'avif':
      return 'image/avif';
    default:
      return 'image/webp'; // Default to WebP for best compression
  }
}

/**
 * Progressive JPEG encoding for better perceived performance
 */
function enableProgressiveJPEG(canvas: OffscreenCanvas, quality: number): Promise<Blob> {
  // Progressive JPEG implementation would go here
  // For now, return standard JPEG
  return canvas.convertToBlob({
    type: 'image/jpeg',
    quality: quality
  });
}

/**
 * Advanced WebP encoding with custom parameters
 */
function encodeWebP(
  canvas: OffscreenCanvas,
  quality: number,
  lossless: boolean = false
): Promise<Blob> {
  const options: ImageEncodeOptions = {
    type: 'image/webp',
    quality: lossless ? 1.0 : quality
  };

  return canvas.convertToBlob(options);
}

/**
 * Batch compression for multiple images
 */
async function compressBatch(
  imageDataArray: ArrayBuffer[],
  options: CompressionOptions
): Promise<WorkerResponse[]> {
  const results: WorkerResponse[] = [];
  
  for (const imageData of imageDataArray) {
    try {
      const result = await compressImage(imageData, options);
      results.push(result);
    } catch (error) {
      results.push({
        error: error instanceof Error ? error.message : 'Batch compression error'
      });
    }
  }
  
  return results;
}

// Export type definitions for TypeScript
export type { CompressionOptions, WorkerMessage, WorkerResponse };