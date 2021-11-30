const { Seeder } = require('mongoose-data-seed')
const { Faculty } = require('./../models/Faculty'),
    faculty = new Faculty().getInstance()

const data = [{
        name: 'Engineering'
    },
    {
        name: 'science',
    },
    {
        name: 'Agricultural Engineering'
    }
];


class FacultySeeder extends Seeder {
    async shouldRun() {
        return faculty.countDocuments()
            .exec()
            .then(count => count === 0);
    }

    async run() {
        await this.removeTable()
        return faculty.create(data);
    }

    async removeTable() {
        return faculty.deleteMany({});
    }
}

module.exports = new FacultySeeder();