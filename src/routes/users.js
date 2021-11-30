'use strict';

const express = require('express'),
    router = express.Router();
const UserController = require('../controllers/User/UserController');
const AuthMiddleware = require('../middlewares/Auth/AuthMiddleware');



// ( index - Create - update ) evaluations for the owner
router.route("/evaluate/:id").post(AuthMiddleware.checkLogin, AuthMiddleware.canEvaluate, UserController.addEvaluate)
    .patch(AuthMiddleware.checkLogin, AuthMiddleware.hasEvaluate, UserController.updateEvaluate)
    .get(UserController.getEvaluationsOfAnOwner)



router.get("/:id", UserController.getUser);


router.get('/teste', async(req, res) => {
    res.send({ a: 'aa' })
});

module.exports = router;