const multer = require('multer');
// Configure multer to upload images
const upload = multer({
    limits: {
        fileSize: 1000000 // 1 MB = 1 Million byte
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

module.exports = upload