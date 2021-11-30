const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

class Comment {
    initSchema() {
        const schema = new Schema({
            text: {
                type: String,
                trim: true,
                required: true
            },
            author: {
                type: Schema.Types.ObjectId,
                ref: "user",
                required: true
            },
            apartment : {
                type: Schema.Types.ObjectId,
                ref: "apartment",
                required: true
            }

        }, { 'timestamps': true })
        
        schema.plugin(uniqueValidator);
        try {
            mongoose.model('comment', schema);
        } catch (e) {

        }
    }
    getInstance() {
        this.initSchema();
        return mongoose.model('comment');
    }
}
module.exports = { Comment }