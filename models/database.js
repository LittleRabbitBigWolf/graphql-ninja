const { Sequelize } = require('sequelize');
//set up database connection

const sequelize = new Sequelize('graphql', 'root', 'bench202', {
    host: 'localhost',
    dialect: 'mysql',
    // operatorsAliases: false,
    define: {
        timestamps: false,
    },
});

module.exports = {
    sequelize,
};
