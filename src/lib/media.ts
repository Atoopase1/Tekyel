// Media upload & compression utilities
import imageCompression from 'browser-image-compression';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = getSupabaseBrowserClient();

/**
 * Compress an image file before upload
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed as File;
  } catch {
    console.warn('Image compression failed, using original');
    return file;
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadMedia(
  file: File,
  chatId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; metadata: Record<string, unknown> }> {
  // Compress images
  let processedFile = file;
  if (file.type.startsWith('image/')) {
    processedFile = await compressImage(file);
  }

  const fileExt = processedFile.name.split('.').pop();
  const fileName = `${chatId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('chat-media')
    .upload(fileName, processedFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('chat-media')
    .getPublicUrl(data.path);

  // Get metadata
  const metadata: Record<string, unknown> = {
    size: processedFile.size,
    filename: processedFile.name,
    mime_type: processedFile.type,
  };

  // Get image dimensions
  if (processedFile.type.startsWith('image/')) {
    const dimensions = await getImageDimensions(processedFile);
    metadata.width = dimensions.width;
    metadata.height = dimensions.height;
  }

  // Get video/audio duration
  if (processedFile.type.startsWith('video/') || processedFile.type.startsWith('audio/')) {
    const duration = await getMediaDuration(processedFile);
    metadata.duration = duration;
  }

  return {
    url: urlData.publicUrl,
    metadata,
  };
}

/**
 * Get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get audio/video duration
 */
function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const media = document.createElement(
      file.type.startsWith('video/') ? 'video' : 'audio'
    );
    media.onloadedmetadata = () => {
      resolve(Math.round(media.duration));
      URL.revokeObjectURL(media.src);
    };
    media.onerror = () => resolve(0);
    media.src = URL.createObjectURL(file);
  });
}

/**
 * Determine message type from file
 */
export function getMessageTypeFromFile(file: File): 'image' | 'video' | 'audio' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
}
