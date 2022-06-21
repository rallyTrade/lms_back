const express = require('express')

const multer = require('multer')

const { s3Uploadv2 } = require('../../config/s3service')

const Router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

// store files in a folder in s3 storage
// const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.fieldname == 'courseVideo') {
        if (file.mimetype.split('/')[0] === 'video') {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_FIELD_COUNT'), false)
        }
    }
    if (file.fieldname == 'courseFile') {
        if (file.mimetype.split('/')[0] === 'application') {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false)
        }
    }
    if (file.fieldname == 'thumbnail') {
        if (file.mimetype.split('/')[0] === 'image') {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_FIELD_VALUE'), false)
        }
    }
}

const upload = multer({ storage, fileFilter })

const multiPart = upload.fields([
    { name: "courseVideo", maxCount: 10 },
    { name: "courseFile", maxCount: 4 },
    { name: "thumbnail", maxCount: 1 }
])

Router.post('/', multiPart, async (req, res) => {
    const getBodyObj = req.body
    const getFileObj = req.files
    // const convertToArray = Object.values(req.files)
    try {
        // const result = await s3Uploadv2(convertToArray)
        console.log(getBodyObj)
        return res.json({
            message: "succesfully uploaded"
        })
    } catch (error) {
        return res.json({
            message: error
        })
    }
})

Router.get('/', async (req, res) => {
    res.json({message: "its working"})
})

module.exports = Router