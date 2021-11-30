const mongoose = require('mongoose');
const { Schema } = require('mongoose');

class FeatureIcon {

    initSchema() {
        const schema = new Schema({
            'feature_name': {
                'type': String,
                'required': true,
            },
            'icon': {
                'type': String,
                'required': true,
            }
        });

        try {
            mongoose.model('feature_icon', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('feature_icon');
    }
}

module.exports = { FeatureIcon };