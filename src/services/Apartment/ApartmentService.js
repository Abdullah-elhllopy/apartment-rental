'use strict';
const { Service } = require('../../../system/services/Service');
const autoBind = require('auto-bind');
const AppError = require('../../utils/appError');
const { HttpResponse } = require('../../../system/helpers/HttpResponse');
const mongoose = require('mongoose');
const sharp = require('sharp')

class ApartmentService extends Service {
    constructor(model, featuresModel, cityModel, commentModel) {
        super(model);
        this.model = model;
        this.featuresModel = featuresModel
        this.cityModel = cityModel
        this.commentModel = commentModel
        autoBind(this);
    }

    async addApartment(req, data, next) {
        try {
            if (!data) new AppError('Please Add your Data', 401);

            let features = await new this.featuresModel({
                description: data.description,
                price: data.price,
                n_of_rooms: data.n_of_rooms,
                n_of_beds: data.n_of_beds,
                furnished: data.furnished,
                maximum_people: data.maximum_people,
                location: data.location,
                near_places: data.near_places,
                hasRefrigerator: data.hasRefrigerator
            })

            if (!features) next(new AppError('there is an error ', 404))

            let newApartment = await this.model.create({
                'title': data.title,
                'isForFamily': data.isForFamily,
                'role': data.type,
                'owner': new mongoose.mongo.ObjectId(req.user._id),
                'isActive': data.isActive,
                'isForStudents': data.isForStudents,
                'maxStudents': data.maxStudents,
                'features': features,
                'address.location': data.location,
                'address.city': data.city

            })

            if (!newApartment) next(new AppError('there is an error ', 404))

            return new HttpResponse(newApartment)
        } catch (error) {
            next(new AppError(error, 401))
        }
    }

    async filterByPrice(query) {
        // age: { $gt: value1, $lt: value2 }
        const max_price = query.mxprice
        const min_price = query.mnprice
        if (max_price || min_price) {
            query['features.price'] = {}
            if (max_price) {
                query['features.price'].$lte = max_price
                delete query.mxprice
            }
            if (min_price) {
                query['features.price'].$gte = min_price
                delete query.mnprice

            }
        }
        return query
    }

    async filterByPlace(query) {

        if (query.city) {
            query['address.city'] = query.city
            delete query.city
        }
        return query
    }

    async getAllApartments(query, next) {
        try {

            // Filter by price
            query = await this.filterByPrice(query)
            query = await this.filterByPlace(query)

            query.isActive = true // get just active apartments

            // the third argument used to select just the first image from images array
            const Apartments = await this.getAll(query, 'title features.description features.price images', { images: { $elemMatch: {} } })
            return new HttpResponse(Apartments)
        } catch (e) {
            next(new AppError(e, 401))
        }
    }

    async getAllOwnerApartments(req, next) {
        try {
            // Filter by price
            req.query = await this.filterByPrice(req.query)

            // Filter by place
            req.query = await this.filterByPlace(req.query)

            req.query.owner = mongoose.mongo.ObjectId(req.params.ownerid)
            req.query.isActive = true
                // the third argument used to select just the first image from images array
            const Apartments = await this.getAll(req.query, 'title features.description features.price images', { images: { $elemMatch: {} } })
            return new HttpResponse(Apartments)
        } catch (e) {
            next(new AppError(e, 401))
        }
    }

    async searchForPlace(city, next) {
        try {
            const cities = await this.cityModel.find({ "name": { $regex: '.*' + city + '.*' } }, 'name').limit(6)
            return new HttpResponse(cities)
        } catch (e) {
            next(new AppError(e, 401))
        }
    }

    // Get all Auth owner apartments even if it is inactive
    async getAllAuthOwnerApartments(req, next) {
        try {
            req.query = await this.filterByPrice(req.query)
            req.query = await this.filterByPlace(req.query)
            req.query.owner = mongoose.mongo.ObjectId(req.user._id)
                // the third argument used to select just the first image from images array
            const Apartments = await this.getAll(req.query, 'title features.description features.price images', { images: { $elemMatch: {} } })
            return new HttpResponse(Apartments)
        } catch (e) {
            next(new AppError(e, 401))
        }
    }
    async deleteApartment(id, next) {
        try {
            await this.delete(id);
            await this.commentModel.deleteMany({ apartment: id });
            return new HttpResponse({ 'message': "item deleted successfully" })
        } catch (e) {
            next(new AppError(e, 204))
        }
    }

    async getApartment(id, next) {
        try {
            const apartment = await this.model
                .findOne({ _id: id, isActive: true })
                .populate('owner', 'name')
                .populate('address.city')


            if (!apartment) {
                next(new AppError('Item not found', 404))
            }
            //   apartment.address.city = 3000

            return new HttpResponse(apartment)
        } catch (errors) {
            throw errors;
        }
    }

    async getAuthOwnerApartment(req, next) {
        try {

            const apartment = await this.model.findOne({ _id: req.params.apartmentid, owner: req.user._id }).populate('owner', 'name').populate('address.city');

            if (!apartment) {
                next(new AppError('Item not found', 404))
            }
            //   apartment.address.city = 3000

            return new HttpResponse(apartment)
        } catch (errors) {
            throw errors;
        }
    }

    async addImage(req, res) {
        // Upload profile photo
        const buffer = await sharp(req.file.buffer).resize({ width: 600, height: 400 }).png().toBuffer()
        req.apartment.images.push({ image: buffer })
        await req.apartment.save()
        return new HttpResponse({ message: 'Image uploaded successfully' })
    }

    async getApartmentComments(id, query) {
        const { skip, limit } = this.handlePagination(query)
        const comments = await this.commentModel.find({ 'apartment': id }).populate({
                path: "author", // in comments, populate author
                select: 'name email'
            }).skip(skip)
            .limit(limit);
        return new HttpResponse(comments)
    }




}

module.exports = { ApartmentService };