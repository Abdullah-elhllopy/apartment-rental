const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const FeaturesSchema = require('./Feature').FeaturesSchema;

class Apartment {
    initSchema() {
        const schema = new Schema({
            'title': {
                'type': String,
                'required': true
            },
            'type': {
                'type': String,
                'enum': ['entire', 'shared', 'private'],
                'default': 'entire'
            },
            'owner': {
                'type': Schema.Types.ObjectId,
                'ref': "user",
                'required': true
            },
            'isForStudents': {
                'type': Boolean,
                'required': true
            },
            'maxStudents': {
                'type': Number,
                'required': isForStudents
            },
            'isActive': {
                'type': Boolean,
                'required': true
            },
            'images': [{
                "image": {
                    "type": Buffer,
                }
            }],
            'address': {
                'location': {
                    'type': String,
                    'required': true
                },
                'city': {
                    'type': Number,
                    'required': true,
                    'ref': "city"
                }
            },
            'features': FeaturesSchema,
            'comments': []

        }, { 'timestamps': true })



        function isForStudents() {
            return this.isForStudents;
        }
        schema.plugin(uniqueValidator);
        try {
            mongoose.model('apartment', schema);
        } catch (e) {

        }
    }
    getInstance() {
        this.initSchema();
        return mongoose.model('apartment');
    }
}
module.exports = { Apartment }