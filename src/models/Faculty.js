const mongoose = require('mongoose');
const { Schema } = require('mongoose');

class Faculty {

    initSchema() {
        const schema = new Schema({
            'name': {
                'type': String,
                'required': false,
            }
        });

        try {
            mongoose.model('faculty', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('faculty');
    }
}

module.exports = { Faculty };