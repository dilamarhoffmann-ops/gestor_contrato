import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage.
 * This is safer than AWS S3 on the frontend as it doesn't expose secret keys.
 */
export const uploadFile = async (file: File, path: string): Promise<{ url: string; key: string }> => {
    const bucket = 'documents';

    // Clean file name to avoid path issues
    const cleanFileName = file.name.replace(/[^\w.-]/g, '_');
    const key = `${path}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(key, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        if (error.message.includes('bucket not found')) {
            throw new Error('Bucket "documents" não encontrado no Supabase. Por favor, crie o bucket no painel do Supabase antes de continuar.');
        }
        console.error('Error uploading file to Supabase:', error);
        throw error;
    }

    // For private buckets, getPublicUrl returns a URL that might not work without auth/RLS.
    // We use getSignedViewUrl for actual viewing/downloading.
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrl, key: data.path };
};

/**
 * Generates a temporary signed URL for viewing or downloading a private file.
 * Valid for 1 hour.
 */
export const getSignedViewUrl = async (key: string): Promise<string> => {
    const bucket = 'documents';
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(key, 3600);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }

    return data.signedUrl;
};
