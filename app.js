const express = require('express')
const multer = require('multer')
const app = express()

require('dotenv').config()

app.use('/v1/lms', require('./src/routers/courses/Course'))

app.listen(1950, () => console.log('server is running'))