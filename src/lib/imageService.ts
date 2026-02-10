import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export const compressAndUploadImage = async (file: File, path: string): Promise<string> => {
    // Options for browser-image-compression
    const options = {
        maxSizeMB: 0.8, // Slightly higher quality ceiling
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/webp' // This ensures the output is converted to WebP
    };

    try {
        console.log(`Original file size: ${file.size / 1024 / 1024} MB (${file.type})`);

        // Compress and automatically convert to WebP via options
        const compressedFile = await imageCompression(file, options);

        // Create a new File object with .webp extension for the storage
        const fileName = `${Date.now()}-${file.name.split('.')[0]}.webp`;
        const webpFile = new File([compressedFile], fileName, { type: 'image/webp' });

        console.log(`Optimized WebP size: ${webpFile.size / 1024 / 1024} MB`);

        const { data, error } = await supabase.storage
            .from('products')
            .upload(`${path}/${webpFile.name}`, webpFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error compressing/uploading image (Zaeom Engine):', error);
        throw error;
    }
};
