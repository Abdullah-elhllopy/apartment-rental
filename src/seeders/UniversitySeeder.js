const { Seeder } = require('mongoose-data-seed')
const { University } = require('./../models/University'),
    university = new University().getInstance()

const data = [{
        name: 'Cairo'
    },
    {
        name: 'Azhar Nasr branch'
    },
    {
        name: 'Ain shams'
    }
];

class UniversitySeeder extends Seeder {

    async run() {
        await this.removeTable()
        return university.create(data);
    }

    async removeTable() {
        return university.deleteMany({});
    }
}

module.exports = new UniversitySeeder();