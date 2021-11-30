const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

/*class Features {
    initSchema(){
        const schema = new Schema({
            'description':{
                'type' : String,
                'required': false
            },
            'price':{
                'type': Number,
                'required': true
            },
           
        }, { 'timestamps': true } )


        schema.plugin( uniqueValidator );
        try {
            mongoose.model( 'features', schema );
        } catch ( e ) {

        }
    }
    getInstance() {
        this.initSchema();
        return mongoose.model( 'features' );
    }
}
module.exports = {Features}
*/

const FeaturesSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    n_of_rooms: {
        type: Number,
        required: true
    },
    n_of_beds: {
        type: Number,
        required: true
    },
    furnished: {
        type: Boolean,
        required: true
    },
    hasRefrigerator: {
        type: Boolean,
        required: true
    },
    maximum_people: {
        type: Number,
        required: true
    },
    near_places: {
        type: String,
        required: true
    }
}, { 'timestamps': true });
const Features = mongoose.model("features", FeaturesSchema);
module.exports = { Features, FeaturesSchema }