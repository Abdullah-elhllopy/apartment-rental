'use strict';
const express = require('express'),
    router = express.Router();
const ApartmentController = require('../controllers/Aparment/ApartmentController');
const { apartment: apartment_prefix } = require('../../config/routePrefix')
const UserController = require('../controllers/User/UserController');
const AuthMiddleware = require('../middlewares/Auth/AuthMiddleware');


// index /api/owner/apartments
router.get('', ApartmentController.getAllApartments);

// index specific owner's apartments
router.get('/owners/:ownerid', ApartmentController.getAllOwnerApartments);

// Read
router.get('/:id', ApartmentController.getApartment);

// Search for place ( Will be optimized later )
router.get('/place/:city', ApartmentController.searchForPlace);


// ( Create - update - Delete ) Comment
router.route("/comments/:id").post(AuthMiddleware.checkLogin, UserController.addComment)
    .delete(AuthMiddleware.checkLogin, AuthMiddleware.hasComment, UserController.deleteComment)
    .patch(AuthMiddleware.checkLogin, AuthMiddleware.hasComment, UserController.updateComment)


// Get comments
router.get('/:id/comments', ApartmentController.getApartmentComments);


module.exports = router;