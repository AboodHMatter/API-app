const userRepository = require('../repositories/user-repository');
const cloudinaryService = require('./cloudinary-service');
const AppError = require('../utils/app-error');

const getAllUsers = async (cursor, limit) => {
    const records = await userRepository.findPaginated(cursor, limit);

    let hasNextPage = false;
    let nextCursor = null;

    if (records.length > limit) {
        hasNextPage = true;
        records.pop(); // Remove the extra item
    }

    if (records.length > 0) {
        nextCursor = records[records.length - 1]._id.toString();
    }

    return {
        data: records,
        nextCursor,
        hasNextPage
    };
};

const updateAvatar = async (userId, buffer) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404, 'fail');
    }

    const uploadResult = await cloudinaryService.uploadImage(buffer);

    if (user.avatarPublicId) {
        await cloudinaryService.deleteImage(user.avatarPublicId);
    }

    user.avatarUrl = uploadResult.secure_url;
    user.avatarPublicId = uploadResult.public_id;
    await user.save();

    return user;
};

module.exports = {
    getAllUsers,
    updateAvatar
};
