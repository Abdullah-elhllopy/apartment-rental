const { AuthService } = require('../../services/Auth/AuthService');
const { Auth } = require('../../models/Auth');
const { User } = require('../../models/User');
const autoBind = require('auto-bind');
const AppError = require('../../utils/appError');
const authService = new AuthService(
    new Auth().getInstance(), new User().getInstance()
);
const crypto = require('crypto');
const { Apartment } = require('./../../models/Apartment');
const { Comment } = require('./../../models/Comment');
const { Evaluate } = require('./../../models/Evaluate');
const apartment = new Apartment().getInstance();
const comment = new Comment().getInstance();
const evaluate = new Evaluate().getInstance();
const user = new User().getInstance();
let ObjectId = require('mongoose').Types.ObjectId;

class AuthMiddleware {
    constructor(service) {
        this.service = service;
        this.userModel = new User().getInstance()
        autoBind(this);
    }

    async checkLogin(req, res, next) {
        try {
            const token = this.extractToken(req);

            req.user = await this.service.checkLogin(token);
            req.authorized = true;
            req.token = token;
            next();
        } catch (e) {
            next(e);
        }
    }

    restrictTo(...roles) {
        return (req, res, next) => {
            // roles ['admin', 'lead-guide']. role='user'
            // while roles dont contain req.user.role send error
            if (!roles.includes(req.user.role)) {
                return next(
                    new AppError('You do not have permission to perform this action', 403)
                );
            }

            next();
        };
    }

    async checkTenantLogin(req, res, next) {
        try {
            const token = this.extractToken(req);

            req.user = await this.service.checkLogin(token);
            req.authorized = true;
            req.token = token;
            if (req.user.role == 'tenant' || req.user.role == 'admin') {
                next();
            } else {
                const error = new Error('Dosen\'t have sufficient roles');

                throw error;
            }
        } catch (e) {
            next(e);
        }
    }

    async checkOwnerLogin(req, res, next) {
        try {
            const token = this.extractToken(req);

            req.user = await this.service.checkLogin(token);

            req.authorized = true;
            req.token = token;
            if (req.user.role == 'owner' || req.user.role == 'admin') {
                next();
            } else {
                const error = new Error('Dosen\'t have sufficient roles');

                throw error;
            }

        } catch (e) {
            next(e);
        }
    }

    // run before route /resetPassword
    async verifyToken(req, res, next) {
        try {

            // 1) Hashing the token
            const hashedToken = crypto
                .createHash('sha256')
                .update(req.params.token)
                .digest('hex');

            // 2) Get user from token
            const user = await this.userModel.findOne({
                'passwordResetToken': hashedToken,
                'passwordResetExpires': { '$gt': Date.now() }
            });

            if (!user) {
                next(new AppError('Token is invalid or has expired', 400))
            }
            req.user = user;
            next()

        } catch (e) {

            next(new AppError('Invalid Digit Code Please Try again', 401))
        }


    }

    extractToken(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }

    async hasApartment(req, res, next) {
        try {
            const exists = await apartment.findOne({ _id: new ObjectId(req.params.id), owner: new ObjectId(req.user._id) })
            if (!exists) next(new AppError('Item not found', 404))
            req.apartment = exists
            next();
        } catch (e) {
            next(new AppError('Item not found', 404))
        }
    }
    async hasComment(req, res, next) {
        try {
            const hasComment = await comment.findOne({ _id: new ObjectId(req.params.id), author: new ObjectId(req.user._id) });
            if (!hasComment) next(new AppError('You are not the owner of this comment', 403));
            next()
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async canEvaluate(req, res, next) {
        try {
            if (req.user._id == req.params.id) next(new AppError('You cant evaluate Your self', 404))
                // الشخص يقدر يقيم نفس المالك مره واحده بس
            const cavEvaluate = await evaluate.findOne({ author: req.user._id, owner: req.params.id });
            if (cavEvaluate) next(new AppError('You cant Evaluate this owner again', 404));
            else next()
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async hasEvaluate(req, res, next) {
        try {
            const hasEvaluate = await evaluate.findOne({ _id: new ObjectId(req.params.id), author: new ObjectId(req.user._id) });
            if (!hasEvaluate) next(new AppError('You do not have permission to perform this action', 403));
            next()
        } catch (e) {
            next(new AppError(e, 404))
        }
    }


}

module.exports = new AuthMiddleware(authService);