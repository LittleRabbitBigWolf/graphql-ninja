const { sequelize } = require('./models/database');
const models = require('./models');

const createData = async () => {
    await models.User.create(
        {
            name: 'Li',
            username: 'li',
            password: 'test1',
            cars: [
                {
                    make: 'BMW',
                    model: '320i',
                    color: 'gold',
                },
            ],
        },
        {
            include: [models.Car],
        }
    );
    await models.User.create(
        {
            name: 'Logan',
            username: 'logan',
            password: 'test2',
            cars: [
                {
                    make: 'Fiat',
                    model: '500',
                    color: 'Blue',
                },
                {
                    make: 'Ford',
                    model: 'Focus',
                    color: 'Green',
                },
            ],
        },
        {
            include: [models.Car],
        }
    );
    await models.User.create(
        {
            name: 'Susan',
            username: 'susan',
            password: 'test3',
            cars: [
                {
                    make: 'Toyota',
                    model: 'Yaris',
                    color: 'Red',
                },
            ],
        },
        {
            include: [models.Car],
        }
    );
};

sequelize.sync({ force: true }).then(async () => {
    try {
        await createData();
        process.exit();
    } catch (error) {
        console.log('error: ', error);
    }
});
