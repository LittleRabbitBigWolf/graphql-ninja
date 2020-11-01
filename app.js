require('dotenv').config();

const express = require('express');
const app = express();
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const models = require('./models');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const jwt = require('jsonwebtoken');

const tradeTokenForUser = (req) => {
    const token = req.headers['x-auth-token'];
    if (token) {
        try {
            //return a verification
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Session expired');
        }
    }
};

// const getCurrentUser = async (req) => {
//     let authToken = null;
//     let currentUser = null;

//     try {
//         authToken = req.headers['x-auth-token'];

//         if (authToken) {
//             currentUser = await tradTokenForUser(authToken);
//         }
//     } catch (err) {
//         console.warn(`Unable to authenticate using auth token: ${authToken}`);
//     }

//     return {
//         authToken,
//         currentUser,
//     };
// };

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        models,
        secret: process.env.JWT_SECRET,
        me: tradeTokenForUser(req),
    }),
});

//tell express to use apollo-server
server.applyMiddleware({ app });
app.use(cors());
app.use(fileUpload());

app.post('/upload', (req, res) => {
    let uploadedFile = req.files.file;
    const filename = req.files.file.name;
    uploadedFile.mv(`${__dirname}/uploads/${filename}`, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
        return res.json(filename);
    });
});

// The `listen` method launches a web server.
app.listen(3001, () => {
    console.log(`🚀  Server ready at 3001`);
});
