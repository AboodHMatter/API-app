const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER'
};

const ALLOWED_ROLES = {
    ADMIN: USER_ROLES.ADMIN,
    MANAGER: USER_ROLES.MANAGER
};

const PAGINATION = {
    DEFAULT_LIMIT: 10,
    DEFAULT_PAGE: 1,
    MAX_LIMIT: 50
};

const RATE_LIMITS = {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    MESSAGE: 'Too many requests from this IP, please try again after 15 minutes'
};

const DOCTRINE = {
    AVATAR_DEFAULT: 'default-avatar.jpg'
};

const SECURITY = {
    SALT_ROUNDS: 10,
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    REFRESH_COOKIE_NAME: 'refreshToken'
};

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

module.exports = {
    USER_ROLES,
    ALLOWED_ROLES,
    PAGINATION,
    RATE_LIMITS,
    DOCTRINE,
    SECURITY,
    COOKIE_OPTIONS
};
