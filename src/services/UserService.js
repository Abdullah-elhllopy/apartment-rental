'use strict';
const { Service } = require('../../system/services/Service');
const autoBind = require('auto-bind');
const nodemailer = require('nodemailer');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { response } = require('express');

class UserService extends Service {
    constructor(model, apartmentModel, commentModel, evaluateModel) {
        super(model);
        this.model = model;
        this.apartmentModel = apartmentModel;
        this.commentModel = commentModel
        this.evaluateModel = evaluateModel
        autoBind(this);
    }

    async updatePassword(id, data) {
        try {
            await this.model.findByIdAndUpdate(id, data, { 'new': true });
            return { 'passwordChanged': true };
        } catch (errors) {
            throw errors;
        }
    }

    /**
     *
     * @param email : string
     * @param includePassword : boolean
     * @returns {Promise<*>}
     */
    async findByEmail(email, includePassword = false) {
        return includePassword ? this.model.findByEmail(email).select('+password') : this.model.findByEmail(email);
    }
    async getUser(id, next) {
        try {
            const user = await this.get(id);
            const apartments = await this.apartmentModel.find({ 'owner': user._id });
            user.apartments = apartments
            return new HttpResponse(user);
        } catch (e) {
            next(e, 404)
        }
    }
    async addComment(req, data, next) {
        try {
            // Check the apartment exists
            const apartment = await this.apartmentModel.findById(req.params.id);
            if (!apartment) next(new AppError('there is no apartment of this id', 401));

            // Create comment
            let newComment = await this.commentModel.create({
                text: data.text,
                author: new mongoose.mongo.ObjectId(req.user._id),
                apartment: new mongoose.mongo.ObjectId(req.params.id)
            })

            if (!newComment) next(new AppError('there is an error ', 404));


            return new HttpResponse(newComment);
        } catch (error) {
            next(new AppError(error, 401))
        }
    }
    async deleteComment(id, next) {
        try {
            if (!id) next(new AppError('there is noComment', 401));

            await this.commentModel.findByIdAndDelete(id)

            return new HttpResponse({ 'message': "item deleted successfully" })
        } catch (e) {
            next(new AppError(e, 204))
        }
    }
    async updateComment(req, next) {
        try {
            const newComment = await this.commentModel.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            })

            if (!newComment)
                return next(new AppError('No Comment Found With This ID ', 404))

            return new HttpResponse(newComment)
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

    async addEvaluate(req, data, next) {
        try {
            if (!data) next(new AppError('Please Add your Data', 401));

            if (data.rate < 1 || data.rate > 5) next(new AppError('the rate should be between 0 and 5', 401));

            const owner = await this.model.findById(req.params.id);

            if (!owner) next(new AppError('there is no owner of this id', 401));

            let evaluate = await this.evaluateModel.create({
                rate: data.rate,
                description: data.description,
                author: new mongoose.mongo.ObjectId(req.user._id),
                owner: new mongoose.mongo.ObjectId(req.params.id)
            })

            // update the rating details for the owner
            const oldRating = owner.rate
            const points = oldRating.points ? oldRating.points + data.rate : data.rate
            const n_of_raters = oldRating.n_of_raters ? oldRating.n_of_raters + 1 : 1

            console.log("Points = " + points)
            await owner.update({ 'rate.points': points, 'rate.n_of_raters': n_of_raters }, { 'new': true });

            if (!evaluate) next(new AppError('there is an error ', 404));
            return new HttpResponse(evaluate)
        } catch (e) {
            next(new AppError(e, 401))
        }
    }
    async updateEvaluate(req, next) {
        try {
            if (req.body.rate < 1 || req.body.rate > 5) next(new AppError('the rate should be between 1 and 5', 401));

            const rate = await this.evaluateModel.findById(req.params.id)
            if (!rate) {
                return next(new AppError('No Tour Evaluate With This ID ', 404))
            }


            // Update the overall rate of the owner and the rating in evaluate collection
            const owner = await this.model.findById(rate.owner)
            const points = owner.rate.points - rate.rate + req.body.rate
            await rate.update(req.body)
            await owner.update({ 'rate.points': points }, { 'new': true });

            // edit response message with the new data
            const response = rate
            response.rate = req.body.rate ? req.body.rate : response.rate
            response.description = req.body.description ? req.body.description : response.description
            return new HttpResponse(response)
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

    async getEvaluationsOfAnOwner(id, query, next) {
        try {
            const { skip, limit } = this.handlePagination(query)
            const evaluation = await this.evaluateModel.find({ owner: id }).populate({
                    path: "author", // in comments, populate author
                    select: 'name email'
                }).skip(skip)
                .limit(limit);
            if (!evaluation) next(new AppError('there is no owner with this id', 404))
            return new HttpResponse(evaluation)
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

    async getOwnerProfile(id, next) {
        const owner = await this.model.findById(id, 'name rate role')
        if (owner.role != 'owner') return next(new AppError('should be owner', 404))

        // Average
        const rate = owner.rate.points / owner.rate.n_of_raters

        const response = {
            name: owner.name,
            rate: { average: rate, n_of_raters: owner.rate.n_of_raters }
        }

        return new HttpResponse(response)
    }

    async sendEmail(options) {
        const transporter = nodemailer.createTransport({
            'host': process.env.EMAIL_HOST,
            'port': process.env.EMAIL_PORT,
            'secure': (process.env.EMAIL_SECURE.toLowerCase() == 'true'), // true for 465, false for other ports
            'auth': {
                'user': process.env.EMAIL_USERNAME,
                'pass': process.env.EMAIL_PASSWORD
            },
            'tls': {
                'rejectUnauthorized': false
            }
        });

        const mailOptions = {
            'from': process.env.EMAIL_FROM,
            'to': options.email,
            'subject': options.subject,
            'text': options.message
        };

        await transporter.sendMail(mailOptions);
        console.log('email sent sucessfully');
    };

}

module.exports = { UserService };