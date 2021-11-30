/* eslint-disable semi */
/* eslint-disable func-style */
/* eslint-disable no-use-before-define */
/* eslint-disable quotes */
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
const crypto = require('crypto');
const owners = ["owner"];
const tenants = ["tenant"];

class User {

    initSchema() {
        const schema = new Schema({
            'name': {
                'type': String,
                'required': true,
            },
            'email': {
                'type': String,
                'unique': true,
                'required': true,
            },
            'apartments': [],
            'password': {
                'type': String,
                'required': true,
                'select': false
            },
            'role': {
                'type': String,
                'enum': ['admin', 'owner', 'tenant'],
                'default': 'tenant'
            },
            'status': {
                'type': Boolean,
                'required': true,
                'default': true
            },

            'identityNumber': { "type": String, "required": isHeOwner, "minlength": 14 },
            'identityImages': [{
                "image": {
                    "type": Buffer,
                    // required: isHeOwner
                }
            }],
            'rate': {
                points: { // total number of evaluations
                    type: Number,
                    default: 0, // updated by the average rate given from users rated him
                    trim: true
                },
                n_of_raters: {
                    type: Number,
                    default: 0
                }
            },

            'isStudent': {
                "type": Boolean,
                "required": isHeTenant
            },
            'university': { // University or Institute
                "type": Schema.Types.ObjectId,
                "ref": 'University',
                "required": isHeStudent && isHeTenant
            },
            'faculty': {
                "type": Schema.Types.ObjectId,
                "ref": 'Faculty',
                "required": isHeStudent && isHeTenant
            },
            'activeLocationLongitude': { // for student and others, if student it will be loc for university
                "type": String
            },
            'activeLocationLatitude': { // for student and others, if student it will be loc for university
                "type": String
            },

            'passwordResetToken': String,
            'passwordResetExpires': Date,
        }, { 'timestamps': true });

        // to make imageid and id number required when role = owner
        function isHeOwner() {
            if (owners.indexOf(this.role) > -1) {
                return true;
            }
            return false;
        }

        function isHeTenant() {
            if (tenants.indexOf(this.role) > -1) {
                return true;
            }
            return false;
        }

        function isHeStudent() {
            return this.isStudent
        }
        schema.methods.createPasswordResetToken = function() {
            const resetToken = crypto.randomBytes(32).toString('hex');

            this.passwordResetToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

            return resetToken;
        };


        // Pre save Hook
        schema.pre('save', function(next) {
            const user = this;

            // Enforce that user role can't be admin except it's edited in DB manually
            if (user.role == 'admin') {
                this.role = 'tenant';
            }


            // only hash the password if it has been modified (or is new)

            if (this.isModified('password') || this.isNew) {
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if (err) {
                        return next(err);
                    }
                    bcrypt.hash(user.password, salt, (hashErr, hash) => {
                        if (hashErr) {
                            return next(hashErr);
                        }
                        // override the cleartext password with the hashed one
                        user.password = hash;
                        next();
                    });
                });
            } else {
                return next();
            }
        });

        // Compare Password
        schema.methods.comparePassword = async function(candidatePassword) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(isMatch);
                    }
                });
            });
        };
        schema.statics.findByEmail = function(email) {
            return this.findOne({ 'email': email });
        };
        schema.plugin(uniqueValidator);
        try {
            mongoose.model('user', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('user');
    }
}

module.exports = { User };