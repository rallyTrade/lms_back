const express = require('express')
const Router = express.Router()

Router.get('*', (req, res) => {
    return res.json({
        status: 404,
        message: 'Not found'
    });
})

module.exports = Router
