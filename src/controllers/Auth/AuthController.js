const { AuthService } = require('./../../services/Auth/AuthService');
const { Auth } = require('./../../models/Auth');
const { User } = require('./../../models/User');
const { Apartment } = require('./../../models/Apartment');
const {Evaluate} = require('./../../models/Evaluate')
const {Comment} = require('./../../models/Comment')

const autoBind = require('auto-bind');
const bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    authService = new AuthService(
        new Auth().getInstance(), new User().getInstance() , new Apartment().getInstance(),new Comment().getInstance() ,new Evaluate().getInstance()
    );
const AppError = require('../../utils/appError');

class AuthController {

    constructor(service) {
        this.service = service;
        autoBind(this);
    }

    async login(req, res, next) {
        try {
            const response = await this.service.login(req.body.email, req.body.password, next);
            await res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async register(req, res, next) {
        try {
            const registeredUserData = await this.service.register(req.body, next);
            await res.status(200).json(registeredUserData);
        } catch (e) {
            next(e);
        }
    }


    async changePassword(req, res, next) {
        try {
            const id = req.user._id;
            bcrypt.genSalt(SALT_WORK_FACTOR, async(err, salt) => {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(req.body.password, salt, async(hashErr, hash) => {
                    if (hashErr) {
                        return next(hashErr);
                    }
                    const data = { 'password': hash },
                        response = await this.service.changePassword(id, data);

                    await res.status(response.statusCode).json(response);
                });
            });
        } catch (e) {
            next(new AppError(e, 404));
        }
    }

    async logout(req, res, next) {
        try {
            const response = await this.service.logout(req.token);

            await res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }


    async forgotPassword(req, res, next) {

        // 1) save token in DB
        const { user, resetToken } = await this.service.saveTokenInDB(req);

        // 2) Generate reset Url and Email message
        const { resetURL, message } = this.service.generate_URL_EmailMessage(req, resetToken)

        // 3) Send it to user's email
        try {
            const response = await this.service.sendTokenViaEmail({
                'email': user.email,
                'subject': 'Your password reset token (valid for 10 min)',
                message
            });

            res.status(200).json(response);

        } catch {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ 'validateBeforeSave': false });
            next(new AppError('Email could not be sent', 500))

        }
    };

    // eslint-disable-next-line no-unused-vars
    async resetPassword(req, res, next) {
        try {
            const response = await this.service.resetMyPassword(req);

            await res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }

    }
    
}

module.exports = new AuthController(authService);