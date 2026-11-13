import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './firebase';

export interface ImageUploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

/**
 * Helper to compress and convert file to data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);
          resolve(compressedDataUrl);
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file directly from user device/gallery to Firebase Cloud Storage.
 * Generates an optimized, permanent downloadable image URL, or instant responsive base64 data URL.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  slotIndex: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported format. Please select JPG, PNG, or WEBP images.');
  }

  // Validate file size (max 10MB per image)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 10MB limit. Please select a smaller photo.');
  }

  // Sanitize file extension
  const extension = file.name.split('.').pop() || 'jpg';
  const cleanProductId = (productId || 'phone_product').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `slot_${slotIndex + 1}_${Date.now()}.${extension}`;
  const storagePath = `products/${cleanProductId}/${filename}`;

  if (onProgress) onProgress(25);

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });

    const cloudPromise = new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(Math.min(95, Math.max(25, percent)));
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    // 6-second timeout before graceful conversion to high-quality compressed data URL
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Cloud storage timeout')), 6000)
    );

    const result = await Promise.race([cloudPromise, timeoutPromise]);
    return result;
  } catch (storageErr) {
    console.warn('Firebase Storage upload falling back to client-side data URL:', storageErr);
    if (onProgress) onProgress(80);
    const dataUrl = await fileToDataUrl(file);
    if (onProgress) onProgress(100);
    return dataUrl;
  }
}
