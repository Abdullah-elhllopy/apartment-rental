const { Controller } = require('../../../system/controllers/Controller');
const autoBind = require('auto-bind');
const { OwnerService } = require('./../../services/Owner/OwnerService');
const ownerService = new OwnerService();

class OwnerController {
    constructor(service) {
        this.service = service
        autoBind(this)
    }


    async uploadIdentityImages(req, res) {
        // res.send({ message: ' NOOOOOO' })
        await this.service.uploadIdentityImages(req, res)
        return new HttpResponse({ 'upload': true });
    }
   

}

module.exports = new OwnerController(ownerService);