// const mongoose = require("mongoose")
// const validator = require('validator')

// const basicInfo = mongoose.Schema({
//     date: { type: Date, default: Date.now },
//     firstName: {
//         type: String,
//         required: true
//     },
//     surname: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         unique: true,
//         lowercase: true,
//         validate(value) {
//             if (!validator.isEmail(value)) {
//                 throw new Error('Email is Invalid')
//             }
//         }
//     },
//     emailToken: {
//         type: String,
//     },
//     isVerified: {
//         type: Boolean,
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true,
//         validate(value) {
//             if (value.length < 5) {
//                 throw new Error('Password is too short')
//             }
//         }
//     },
//     TCP: {
//         type: Boolean,
//         required: true,
//         validate(value) {
//             if (value === false) {
//                 throw new Error('You must agree to the terms and condition to continue')
//             }
//         }
//     },
//     admin: {
//         type: Boolean
//     },
//     employer: {
//         type: Boolean
//     }

// })

// module.exports = mongoose.model('houseBasicInfo', basicInfo)