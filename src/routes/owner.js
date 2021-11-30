'use strict';
const OwnerController = require('../controllers/Owner/OwnerController');
const AuthMiddleware = require('../middlewares/Auth/AuthMiddleware');
const ApartmentController = require('../controllers/Aparment/ApartmentController');

const upload = require('../../config/multer')
const express = require('express'),
    router = express.Router();
const UserController = require('../controllers/User/UserController');

const { apartment: apartment_prefix } = require('../../config/routePrefix')

// Upload identity images one by one
router.post('/upload/identityimages', AuthMiddleware.checkLogin, upload.single('identityImages'), OwnerController.uploadIdentityImages);


// Get the Owner's basic profile
router.get("/:id/profile", UserController.getOwnerProfile);

/* 
    Apartment
*/

// index All of the Auth owner apartments
router.get(`/${apartment_prefix}`, AuthMiddleware.checkLogin, ApartmentController.getAllAuthOwnerApartments);

// Create
router.post(`/${apartment_prefix}/create`, AuthMiddleware.checkLogin, AuthMiddleware.restrictTo('owner'), ApartmentController.addApartment);

// Read Auth owner's specific apartment (active or unactive) : may be used to get data while the owner edit like unactive flat
router.get(`/${apartment_prefix}/:apartmentid`, AuthMiddleware.checkLogin, ApartmentController.getAuthOwnerApartment);

// update
router.patch(`/${apartment_prefix}/:id`, AuthMiddleware.checkLogin, AuthMiddleware.hasApartment, AuthMiddleware.restrictTo('owner'), ApartmentController.updateApartment)

// Delete
router.delete(`/${apartment_prefix}/:id`, AuthMiddleware.checkLogin, AuthMiddleware.hasApartment, AuthMiddleware.restrictTo('owner'), ApartmentController.delateApartment)

// Add apartment images one by one
router.post(`/${apartment_prefix}/:id/images`, AuthMiddleware.checkLogin, AuthMiddleware.hasApartment, upload.single('image'), ApartmentController.addImage);




module.exports = router;