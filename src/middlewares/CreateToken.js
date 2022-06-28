const jwt = require('jsonwebtoken');
const maxAge = 3 * 24 * 60 * 60

exports.createToken = async (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    })
}

exports.verifyToken = async (req, res, next) => {
    const token = req.cookies.userToken
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        return next()

    } catch (error) {
        return res.json({
            status: 401,
            message: error
        })
    }
}

exports.is_super_user = async (req, res, next) => {
    const isAdmin = req.cookies.is_super_user

    if (isAdmin == 'true') next()
    else return res.json({
        status: 403,
        message: 'unauthorized user'
    })
}