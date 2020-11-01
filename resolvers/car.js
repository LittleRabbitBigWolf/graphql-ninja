// context allows we share data in graphQL
const resolvers = {
    Query: {
        cars: (parent, args, context) => context.models.Car.findAll(),
        car: (parent, args, context) => {
            // const car = context.models.cars.filter(
            //     (carEl) => carEl.id === args.id
            // );
            // return car[0];
            return context.models.Car.findByPk(args.id);
        },
    },

    Mutation: {
        createCar: (parent, { make, model, color }, { models, me }) => {
            if (!me) {
                throw new Error('Not authenticated');
            }
            const newCar = { make, model, color, userId: me.id };
            // context.models.cars.push(newCar);
            // return newCar;
            return models.Car.create(newCar);
        },
        removeCar: (parent, { id }, { models }) => {
            return models.Car.destroy({
                where: {
                    id,
                },
            });
        },
    },

    //custom resolver
    Car: {
        owner: (parent, args, context) => {
            // console.log('parent in car: ', parent);
            // return context.models.users.find(
            //     (user) => parent.ownedBy === user.id
            // );
            return context.models.User.findByPk(parent.userId);
        },
    },
};

module.exports = resolvers;
