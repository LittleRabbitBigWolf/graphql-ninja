const bcrypt = require('bcrypt');

const user = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        name: {
            type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true,
            },
        },
        photo: {
            type: DataTypes.STRING,
        },
    });

    // DO NOT USE ARROW FN HERE
    User.prototype.hasPassword = async function () {
        return await bcrypt.hash(this.password, 10);
    };

    // instance method prototype
    User.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };
    User.associate = (models) => {
        //1 to many relationship
        User.hasMany(models.Car, { onDelete: 'CASCADE' });
    };

    User.beforeCreate(async (newUser) => {
        newUser.password = await newUser.hasPassword(newUser.password);
    });

    return User;
};

module.exports = user;
