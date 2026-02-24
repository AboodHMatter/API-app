const User = require('../models/user-model');

class UserRepository {
    async findPaginated(cursor, limit) {
        const query = {};
        if (cursor) {
            query._id = { $lt: cursor };
        }

        // _id contains a timestamp. Sorting by _id: -1 implicitly sorts by creation date descending.
        const data = await User.find(query, { __v: false, password: false, refreshTokens: false })
            .sort({ _id: -1 })
            .limit(limit + 1); // Fetch one extra to determine if there's a next page

        return data;
    }

    async findById(id) {
        return User.findById(id);
    }

    async findOne(query) {
        return User.findOne(query);
    }

    async findByEmailWithPassword(email) {
        return User.findOne({ email }).select('+password');
    }

    async create(data) {
        return User.create(data);
    }
}

module.exports = new UserRepository();
