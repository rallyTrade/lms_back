const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/v1/lms/course', require('./src/routers/courses/Course'))
app.use('/v1/lms/quiz', require('./src/routers/quiz/Quiz'))
app.use('/v1/lms/onboarding', require('./src/routers/onboarding/Onboarding'))

app.listen(1950, () => console.log('server is running'))