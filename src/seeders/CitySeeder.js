const { Seeder } = require('mongoose-data-seed')
const { City } = require('./../models/City'),
    city = new City().getInstance()

const data = [{
        _id: 1,
        name: 'cairo'
    },
    {
        _id: 2,
        name: 'giza',
    },
    {
        _id: 3,
        name: 'alexandria'
    }
];


class CitySeeder extends Seeder {
    async shouldRun() {
        return city.countDocuments()
            .exec()
            .then(count => count === 0);
    }

    async run() {
        await this.removeTable()
        return city.create(data);
    }

    async removeTable() {
        return city.deleteMany({});
    }
}

module.exports = new CitySeeder();