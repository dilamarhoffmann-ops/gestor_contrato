import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
});

export const uploadFileToS3 = async (file: File, path: string): Promise<string> => {
    const bucketName = import.meta.env.VITE_S3_BUCKET;
    const key = `${path}/${Date.now()}_${file.name}`;

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // Construct the public URL (assuming the bucket has public read or a policy)
        // For sa-east-1, the URL format is https://BUCKET.s3.REGION.amazonaws.com/KEY
        return `https://${bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
};
