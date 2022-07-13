const express = require('express')
const cookieParser = require('cookie-parser')
// var cors = require('cors')
const app = express()


// const corsOpts = {
//     origin: '*',

//     methods: [
//         'GET',
//         'POST',
//     ],

//     allowedHeaders: [
//         'Content-Type',
//     ],
// };

require('dotenv').config()
const currentPort = process.env.PORT || 1950
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// app.use(cors(corsOpts))

app.use('/v1/lms/course', require('./src/routers/courses/Course'))
app.use('/v1/lms/quiz', require('./src/routers/quiz/Quiz'))
app.use('/v1/lms/onboarding', require('./src/routers/onboarding/Onboarding'))
app.use('/', require('./src/routers/error'))

app.listen(currentPort, () => process.env.PORT ? '' : console.log('server is running'))