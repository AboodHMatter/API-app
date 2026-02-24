const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const AppError = require('../utils/app-error');

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

const uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'avatars',
                width: 300,
                height: 300,
                crop: 'fill'
            },
            (error, result) => {
                if (error) {
                    return reject(new AppError('Image upload failed', 500, 'error'));
                }
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new AppError('Failed to delete old image', 500, 'error');
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
