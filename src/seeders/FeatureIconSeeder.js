const { Seeder } = require('mongoose-data-seed')
const { FeatureIcon } = require('./../models/FeatureIcon'),
    featureIcon = new FeatureIcon().getInstance()

const data = [{
        feature_name: 'n_of_rooms',
        icon: 'n_of_rooms.png'
    },
    {
        feature_name: 'n_of_beds',
        icon: 'n_of_beds.png'
    },
    {
        feature_name: 'furnished',
        icon: 'furnished.png'
    },
    {
        feature_name: 'maximum_people',
        icon: 'maximum_people.png'
    },

];


class FeatureIconSeeder extends Seeder {
    async shouldRun() {
        return featureIcon.countDocuments()
            .exec()
            .then(count => count === 0);
    }

    async run() {
        await this.removeTable()
        return featureIcon.create(data);
    }

    async removeTable() {
        return featureIcon.deleteMany({});
    }
}

module.exports = new FeatureIconSeeder();