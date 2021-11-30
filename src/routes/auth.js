'use strict';
const AuthController = require('../controllers/Auth/AuthController');
const AuthMiddleware = require('../middlewares/Auth/AuthMiddleware');
const express = require('express'),
    router = express.Router();

router.post('/login', AuthController.login);
router.get('/logout',  AuthMiddleware.checkLogin, AuthController.logout);
router.post('/register', AuthController.register);


router.post('/changePassword' , AuthMiddleware.checkLogin, AuthController.changePassword);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthMiddleware.verifyToken, AuthController.resetPassword);


module.exports = router;