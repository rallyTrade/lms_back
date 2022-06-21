const express = require('express')
const multer = require('multer')
const app = express()

require('dotenv').config()

app.use('/v1/lms', require('./src/routers/courses/Course'))

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code == 'LIMIT_FIELD_COUNT') {
            return res.json({
                status: 400,
                message: 'file type is not supported, it should be a video'
            })
        }
        if (error.code == 'LIMIT_UNEXPECTED_FILE') {
            return res.json({
                status: 400,
                message: 'file type is not supported, it should be a document'
            })
        }
        if (error.code == 'LIMIT_FIELD_VALUE') {
            return res.json({
                status: 400,
                message: 'file type is not supported, it should be an image'
            })
        }
    }

    next()
})

app.listen(1950, () => console.log('server is running'))