const mongoose = require('mongoose');
const { Schema } = require('mongoose');

class University {

    initSchema() {
        const schema = new Schema({
            'name': {
                'type': String,
                'required': false,
            }
        });

        try {
            mongoose.model('university', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('university');
    }
}

module.exports = { University };