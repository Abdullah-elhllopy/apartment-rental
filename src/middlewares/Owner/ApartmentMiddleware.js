const { User } = require('../../models/User');
const autoBind = require('auto-bind');
const AppError = require('../../utils/appError');

class ApartmentMiddleware {
    constructor() {
        this.userModel = new User().getInstance()
        autoBind(this);
    }



}

module.exports = new ApartmentService();