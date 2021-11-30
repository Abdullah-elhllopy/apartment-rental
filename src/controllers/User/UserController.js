const autoBind = require('auto-bind');
const { UserService } = require('./../../services/UserService');
const { Apartment } = require('./../../models/Apartment');
const { Comment } = require('./../../models/Comment')
const { User } = require('./../../models/User');
const { Evaluate } = require('./../../models/Evaluate')
const AppError = require('../../utils/appError');
const userService = new UserService(new User().getInstance(), new Apartment().getInstance(), new Comment().getInstance(), new Evaluate().getInstance())

class UserController {
    constructor(service) {
        this.service = service
        autoBind(this)
    }

    // getUser

    async getUser(req, res, next) {
        try {
            const user = await this.service.getUser(req.params.id, next);
            await res.status(200).json(user);
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async addComment(req, res, next) {
        try {
            if (!req.body) next(new AppError('Please Add your Data', 401));

            const newComment = await this.service.addComment(req, req.body, next);
            await res.status(200).json(newComment)
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async deleteComment(req, res, next) {
        try {
            await res.status(200).json(await this.service.deleteComment(req.params.id, next))
        } catch (e) {
            next(new AppError(e, 204))
        }
    }
    async updateComment(req, res, next) {
        try {
            await res.status(200).json(await this.service.updateComment(req, next))
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async addEvaluate(req, res, next) {
        try {
            const evaluate = await this.service.addEvaluate(req, req.body, next);
            await res.status(200).json(evaluate)
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async updateEvaluate(req, res, next) {
        try {
            await res.status(200).json(await this.service.updateEvaluate(req, next))
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async getEvaluationsOfAnOwner(req, res, next) {
        try {
            await res.status(200).json(await this.service.getEvaluationsOfAnOwner(req.params.id, req.query, next))
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

    async getOwnerProfile(req, res, next) {
        try {
            await res.status(200).json(await this.service.getOwnerProfile(req.params.id, next))
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

}

module.exports = new UserController(userService);