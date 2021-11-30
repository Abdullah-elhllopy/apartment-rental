const mongoose = require('mongoose');
const { Schema } = require('mongoose');

class City {

    initSchema() {
        const schema = new Schema({
            '_id': {
                type: Number
            },
            'name': {
                'type': String,
                'required': false,
            }
        });

        try {
            mongoose.model('city', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('city');
    }
}

module.exports = { City };