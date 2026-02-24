const userRoles = {
    USER: "USER",
    ADMIN: "ADMIN",
    MANAGER: "MANAGER"
};

const allowedRoles = {
    ADMIN: userRoles.ADMIN,
    MANAGER: userRoles.MANAGER
};

module.exports = { userRoles, allowedRoles };
