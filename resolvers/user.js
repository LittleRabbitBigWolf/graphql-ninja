const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const { GraphQLScalarType } = require('graphql');

// helper function using jsonwebtoken to create a token
const createToken = (user, secret, expiresIn) => {
    const { id, name, username, photo } = user;
    return jwt.sign({ id, name, username, photo }, secret, { expiresIn });
};

const resolvers = {
    Query: {
        users: (parent, args, context) => context.models.User.findAll(),
        user: (parent, { id }, { models }) => {
            return models.User.findByPk(id);
            // console.log('user : ', user);
            // return user[0];
        },
        me: (_, __, context) => {
            console.log(' context: ', context);
            return context.me;
        },
    },

    Mutation: {
        makeUser: (parent, args, context) => {
            // console.log('args: ', args);
            const { name } = args;
            const newUser = { name };
            // context.models.users.push(newUser);
            // return newUser;
            //Id is auto generate
            return context.models.User.create(newUser);
        },
        removeUser: (parent, { id }, { models }) => {
            return models.User.destroy({
                where: {
                    id,
                },
            });
        },
        register: async (parent, args, { models }) => {
            const { name, username, password } = args;
            const newUser = {
                name,
                username,
                password,
            };
            const registeredUser = await models.User.create(newUser);
            try {
                if (typeof registeredUser.id === 'number') {
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                console.log('err: ', err);
                return false;
            }
        },
        login: async (parent, { username, password }, { models, secret }) => {
            const user = await models.User.findOne({ where: { username } });
            if (!user) {
                throw new Error('User not found');
            }
            const isValid = await user.validatePassword(password);
            if (!isValid) {
                throw new Error('Password is incorrect');
            }
            return {
                token: createToken(user, secret, '60m'),
            };
        },
        uploadImage: async (parent, { filename }, { models, me }) => {
            if (!me) {
                throw new Error('Not authenticated!');
            }
            const path = require('path');
            const mainDir = path.dirname(require.main.filename);
            filename = `${mainDir}/uploads/${filename}`;
            try {
                const photo = await cloudinary.v2.uploader.upload(filename);
                await models.User.update(
                    {
                        photo: `${photo.public_id}.${photo.format}`,
                    },
                    {
                        where: {
                            username: me.username,
                        },
                    }
                );
                // console.log('photo: ', photo);
                return `${photo.public_id}.${photo.format}`;
            } catch (error) {
                throw new Error(error);
            }
        },
    },

    User: {
        cars: (parent, args, context) => {
            // return parent.cars.map((carId) =>
            //     context.models.cars.find((carEl) => carEl.id === carId)
            // );
            return context.models.Car.findAll({
                where: {
                    userId: parent.id,
                },
            });
        },
        //create custom fn since the photo needs to be overwritten
        photo: (parent, { options }) => {
            console.log('options: ', options);
            let url = cloudinary.url(parent.photo);
            if (options) {
                // width: Int, q_auto: Boolean, f_auto: Boolean, face: 'face'
                const [width, q_auto, f_auto, face] = options;
                const cloudinaryOptions = {
                    ...(q_auto === 'true' && { quality: 'auto' }),
                    ...(f_auto === 'true' && { fetch_format: 'auto' }),
                    ...(face && { crop: 'thumb', gravity: 'face' }),
                    width,
                    secure: true,
                };
                url = cloudinary.url(parent.photo, cloudinaryOptions);
                return url;
            }
            return url;
        },
    },

    CloudinaryOptions: new GraphQLScalarType({
        name: 'CloudinaryOptions',
        parseValue(value) {
            return value;
        },
        serialize(value) {
            return value;
        },
        parseLiteral(ast) {
            return ast.value.split(',');
        },
    }),
};

module.exports = resolvers;
