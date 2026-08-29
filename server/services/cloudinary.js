import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpxukzvik',
  api_key: process.env.CLOUDINARY_API_KEY || '179245747396695',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lzDxY6pzolFibur5xsuN3LzBWGs',
  secure: true
});

/**
 * Upload buffer or Base64 string to Cloudinary with automatic WebP optimization
 */
export async function uploadToCloudinary(bufferOrBase64, folder = 'as_commerce_products') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    if (Buffer.isBuffer(bufferOrBase64)) {
      uploadStream.end(bufferOrBase64);
    } else if (typeof bufferOrBase64 === 'string') {
      cloudinary.uploader.upload(
        bufferOrBase64,
        {
          folder,
          format: 'webp',
          transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    } else {
      reject(new Error('Invalid upload payload'));
    }
  });
}

export default cloudinary;
