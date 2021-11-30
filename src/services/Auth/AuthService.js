'use strict';
const { UserService } = require('../UserService');
const autoBind = require('auto-bind');
const { HttpResponse } = require('../../../system/helpers/HttpResponse');
const mongoose = require('mongoose');
const AppError = require('../../utils/appError');

class AuthService {
    constructor(model, userModel ,apartmentModel ,commentModel ,evaluateModel) {
        this.model = model;
        this.userService = new UserService(userModel,apartmentModel ,commentModel,evaluateModel);
        this.userModel = userModel;
        autoBind(this);
    }

    /**
     *
     * @param email: String
     * @param password: String
     * @param next
     * @returns {Promise<any>}
     */
    async login(email, password, next) {
        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }
        const user = await this.userService.findByEmail(email, true);

        if (!user) {
            next(new AppError('Incorrect email ', 401))
        } else {
            // Process Login
            try {
                // Check Password
                const passwordMatched = await user.comparePassword(password);
                if (!passwordMatched) {
                    next(new AppError('Incorrect email or password', 401))
                }
                const token = await this.model.generateToken(user);
                await this.model.create({ token, 'user': new mongoose.mongo.ObjectId(user._id) });
                const tokenData = await this.model.findOne({ 'token': token }).populate('user');
                
                return new HttpResponse(tokenData);
            } catch (e) {
                next(new AppError(e, 401))
            }

        }
    }

    async register(data, next) {
        try {
            return await this.userService.insert(data);
        } catch (error) {
            next(new AppError(error, 401))
        }
    }

    async changePassword(id, data) {
        try {
            const updatedPassword = await this.userService.updatePassword(id, data);

            return new HttpResponse(updatedPassword);
        } catch (error) {
            throw error;
        }
    }

    async logout(token) {
        try {
            await this.model.deleteOne({ token });
            return new HttpResponse({ 'logout': true });
        } catch (error) {
            throw error;
        }
    }

    async checkLogin(token) {
        try {
            // Check if the token is in the Database
            const tokenInDB = await this.model.countDocuments({ token });

            if (!tokenInDB) {
                const error = new Error('Invalid Token');

                error.statusCode = 401;
                throw error;
            }
            // Check the token is a valid JWT
            const user = await this.model.decodeToken(token);

            if (!user) {
                const error = new Error('Invalid Token');

                error.statusCode = 401;
                throw error;
            }
            // Check the Extracted user is active in DB
            const userFromDb = await this.userService.get(user._id);

            //if (userFromDb.data && userFromDb.data.status) {
            return userFromDb;
            //   }
            const error = new Error('Invalid Token');

            error.statusCode = 401;
            throw error;

        } catch (e) {
            const error = new Error('Invalid Token');

            error.statusCode = 401;
            throw error;
        }
    }

    async saveTokenInDB(req) {
        // 1) Get user based on POSTed email
        const user = await this.userModel.findOne({ 'email': req.body.email });

        if (!user) {
            const error = new Error('there is no user with this email');

            error.statusCode = 401;
            throw error;
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();

        await user.save({ 'validateBeforeSave': false });

        return ({ user, resetToken });

    }


    // to verify token that sent from client
    async resetMyPassword(req) {
        try {
            // Update User Collection
            req.user.password = req.body.password;
            req.user.passwordResetToken = undefined;
            req.user.passwordResetExpires = undefined;
            await req.user.save();


            // Generate token
            const token = await this.model.generateToken(req.user);

            // Save token in Auth collection
            await this.model.create({ token, 'user': new mongoose.mongo.ObjectId(req.user._id) });
            const tokenData = await this.model.findOne({ 'token': token }).populate('user');
            return new HttpResponse(tokenData);
        } catch (e) {
            throw e
        }
    }

    generate_URL_EmailMessage(req, resetToken) {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        return { resetURL, message }
    }

    async sendTokenViaEmail(option) {
        await this.userService.sendEmail(option);
        return new HttpResponse({ sent: "true" });
    }


   

}

module.exports = { AuthService };