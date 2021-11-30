const { ApartmentService } = require('./../../services/Apartment/ApartmentService');
const { Apartment } = require('./../../models/Apartment');
const { Features } = require('../../models/Feature');
const { City } = require('../../models/City');
const { Comment } = require('../../models/Comment')
const autoBind = require('auto-bind');
const AppError = require('../../utils/appError');
const apartmentService = new ApartmentService(new Apartment().getInstance(), Features, new City().getInstance(), new Comment().getInstance());

class ApartmentController {

    constructor(service) {
        this.service = service;
        autoBind(this);
    }

    async addApartment(req, res, next) {
        try {
            const apartmentData = await this.service.addApartment(req, req.body, next)
            await res.status(201).json(apartmentData);
        } catch (e) {
            next(e);
        }
    }

    async getAllApartments(req, res, next) {
        try {
            const apartments = await this.service.getAllApartments(req.query, next)
            await res.status(200).json(apartments);
        } catch (e) {
            next(new AppError(e, 401))
        }
    }

    async getAllOwnerApartments(req, res, next) {
        try {
            const apartments = await this.service.getAllOwnerApartments(req, next)
            await res.status(200).json(apartments);
        } catch (e) {
            next(new AppError(e, 401))
        }
    }

    async getAllAuthOwnerApartments(req, res, next) {
        try {
            const apartments = await this.service.getAllAuthOwnerApartments(req, next)
            await res.status(200).json(apartments);
        } catch (e) {
            next(new AppError(e, 401))
        }
    }
    async delateApartment(req, res, next) {
        try {
            await res.status(200).json(await this.service.deleteApartment(req.params.id, next));
        } catch (e) {
            next(new AppError(e, 204))
        }
    }
    async updateApartment(req, res, next) {
        try {
            await res.status(200).json(await this.service.update(req.params.id, req.body));
        } catch (e) {
            next(new AppError(e, 404))
        }
    }


    async searchForPlace(req, res, next) {
        try {
            console.log(req.params.city)
            console.log("====================")
            await res.status(200).json(await this.service.searchForPlace(req.params.city, next));
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async getApartment(req, res, next) {
        try {
            await res.status(200).json(await this.service.getApartment(req.params.id, next));
        } catch (e) {
            next(new AppError(e, 404))
        }
    }

    async getAuthOwnerApartment(req, res, next) {
        try {
            await res.status(200).json(await this.service.getAuthOwnerApartment(req, next));
        } catch (e) {
            next(new AppError(e, 404))
        }
    }
    async addImage(req, res) {
        const response = await this.service.addImage(req, res)
        return res.status(201).send(response);
    }

    async getApartmentComments(req, res, next) {
        try {
            await res.status(200).json(await this.service.getApartmentComments(req.params.id, req.query));
        } catch (e) {
            next(new AppError(e, 404))
        }
    }



}
module.exports = new ApartmentController(apartmentService)