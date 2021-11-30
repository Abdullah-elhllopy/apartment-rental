'use strict';
const sharp = require('sharp')

class OwnerService {
    constructor() {

    }


    async uploadIdentityImages(req, res) {

        // Upload profile photo
        const buffer = await sharp(req.file.buffer).resize({ width: 400, height: 400 }).png().toBuffer()
        req.user.identityImages.push({ image: buffer })
        await req.user.save()
        res.send({ message: 'Image uploaded successfully' })
    }
}

module.exports = { OwnerService };