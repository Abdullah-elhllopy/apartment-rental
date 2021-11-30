const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

class Evaluate {
    initSchema() {
        const schema = new Schema({
            rate: {
                type: Number,
                trim: true,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            author: {
                type: Schema.Types.ObjectId,
                ref: "user",
                required: true
            },
            owner: {
                type: Schema.Types.ObjectId,
                ref: "user",
                required: true
            }

        }, { 'timestamps': true })

        schema.plugin(uniqueValidator);
        try {
            mongoose.model('evaluate', schema);
        } catch (e) {

        }
    }
    getInstance() {
        this.initSchema();
        return mongoose.model('evaluate');
    }
}
module.exports = { Evaluate }