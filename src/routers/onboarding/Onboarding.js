const express = require('express')

const { onboardingDynamoDBv2, updateScores, scanDynamoDBOnboardingv2, scanDynamoByIDv2, updateStaffInfo, deleteDynamoByIDOnboarding, queryOnboardingUser, forgotPassword, notification } = require('../../config/DynamoServiceOnboarding')

const { createToken, verifyToken, is_super_user } = require('../../middlewares/CreateToken')

const Router = express.Router()


// baseurl/v1/lms/onboading -> route for get
Router.post('/', async (req, res) => {
    const getBodyObj = req.body;

    try {

        // check if file field is missing
        if (typeof getBodyObj.staff_id === 'undefined' || typeof getBodyObj.email === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.staff_id == '' || getBodyObj.email == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        const result = await onboardingDynamoDBv2(getBodyObj)
        console.log(result)

        if (result == null) {
            return res.json({
                status: 409,
                message: 'Staff account already exist'
            })
        } else {
            return res.json({
                status: 201,
                message: 'Staff account successfully created'
            })
        }

    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

// baseurl/v1/lms/onboarding/:id -> route for get
// staff score is updated
Router.patch('/:id', verifyToken, async (req, res) => {
    const getBodyObj = req.body
    const getItemID = req.params.id

    try {

        // check if file field is missing
        if (typeof getBodyObj.score_count === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.score_count == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        const result = await scanDynamoByIDv2(getItemID)

        if (!Object.keys(result).length) {
            return res.json({
                status: 400,
                message: 'Bad Request, undefined user id'
            })
        } else {
            await updateScores(getItemID, getBodyObj)
            return res.json({
                status: 200
            })
        }

    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

// baseurl/v1/lms/onboarding -> route for get
Router.get('/', verifyToken, is_super_user, async (req, res) => {

    try {
        // get the scan result
        let scanResult = await scanDynamoDBOnboardingv2()

        // check if items are null, or not an array or no items
        if (scanResult.Items === null || !Array.isArray(scanResult.Items) || scanResult.Items.length === 0) {
            return res.json({
                status: 404,
                message: 'No Item found'
            })
        } else {

            // send response to client
            return res.json({ status: 200, message: "success", data: scanResult })
        }
    } catch (error) {
        return res.json({
            status: 500,
            error
        });
    }
})

// baseurl/v1/lms/onboarding/:id -> get item by id
// get individual staff by ID
Router.get('/:id', verifyToken, async (req, res) => {
    const getItemID = req.params.id

    try {
        //dynamodb scan by id
        const result = await scanDynamoByIDv2(getItemID)
        // check if item is null
        if (result.Item === null) {
            return res.json({
                status: 404,
                message: 'No Item found',
            });
        }
        // check if item is undefined
        else if (result.Item === undefined || !getItemID) {
            return res.json({
                status: 400,
                message: 'undefined parameters 23'

            });
        } else {
            // onsuccess
            return res.json({
                status: 200,
                message: 'successfull',
                data: result
            })
        }

    } catch (error) {
        res.json({
            status: 500,
            error
        });
    }

})

// baseurl/v1/lms/onboarding/:id -> route for get
// staff should be able to update there information
Router.put('/:id', async (req, res) => {
    const getBodyObj = req.body
    const getItemID = req.params.id
    const scanResult = await scanDynamoByIDv2(getItemID)

    try {

        // check if file field is missing
        if (typeof getBodyObj.first_name === 'undefined' || typeof getBodyObj.last_name === 'undefined' || typeof getBodyObj.password === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.first_name === '' || getBodyObj.last_name === '' || getBodyObj.password === '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        if (!Object.keys(scanResult).length) {
            return res.json({
                status: 403,
                message: 'Invalid User ID'
            })
        }

        // check if staff ID or email is equivalent to the ID 
        if (scanResult.Item.staff_id !== scanResult.Item.staff_id || scanResult.Item.email !== scanResult.Item.email) {
            return res.json({
                status: 403,
                message: 'Unauthorized staff ID or email'
            })
        }


        await updateStaffInfo(getItemID, getBodyObj)
        return res.json({
            status: 201,
            message: 'Staff account successfully created'
        })

    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

Router.post('/forgot_password', async (req, res) => {
    const getBodyObj = req.body;
    const changePwdUrl = `${req.protocol}://${req.get('host')}/onboarding`

    try {
        // check if file field is missing
        if (typeof getBodyObj.email === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.email == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        const result = await forgotPassword(getBodyObj.email)

        if (result.Items.length < 1) {
            return res.json({
                status: 404,
                message: 'this user is not registerd, contact the HR'
            })
        }

        if (result.Items[0].email !== getBodyObj.email) {

            return res.json({
                status: 404,
                message: 'this user is not registerd, contact the HR'
            })

        } else {
            await notification(getBodyObj.email, `Forex Rally Learn Managent System \n Please click on the link below to change your password \n ${changePwdUrl}/${result.Items[0].id}`)
            return res.json({
                status: 200,
                message: `Email have been sent to ${result.Items[0].email}`
            })
        }

    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

// login a user
Router.post('/login', async (req, res) => {
    const getBodyObj = req.body;

    try {
        // check if file field is missing
        if (typeof getBodyObj.staff_id === 'undefined' || typeof getBodyObj.password === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.staff_id == '' || getBodyObj.password == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        // compare user password in DB
        const result = await queryOnboardingUser(getBodyObj)

        // store user category oncookies
        res.cookie('is_super_user', result.getID.super_user, {
            maxAge: 3 * 24 * 60 * 60 * 1000
        })

        // check if password compare is true
        if (result == null) {

            return res.json({
                status: 400,
                message: 'Please change your password and try again'
            })

        }

        if (result.comparePwd) {

            // parse the user id to generate a token
            const token = await createToken(result.getID.id)

            // save the token on user browser
            res.cookie('userToken', token, {
                httpOnly: true,
                maxAge: 3 * 24 * 60 * 60 * 1000
            })
            // on success
            return res.json({
                status: 200,
                message: 'logged in'
            })

        } else {
            return res.json({
                status: 400,
                message: 'Bad Request, incorrect password or staff ID'
            })
        }

    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

// baseurl/v1/lms/quiz/:id -> delete item by id
Router.delete('/:id', verifyToken, is_super_user, async (req, res) => {
    const getItemID = req.params.id

    try {
        // dynamodb delete item from table
        await deleteDynamoByIDOnboarding(getItemID)

        return res.json({
            status: 200,
            message: 'successfully deleted'
        })

    } catch (error) {
        return res.json({
            status: 500,
            error
        });
    }
})

// log user out
Router.get('/v2/logout', verifyToken, async (req, res) => {
    try {
        res.cookie('userToken', '', { maxAge: 1 })
        return res.json({
            status: 200,
            message: 'logged out'
        });

    } catch (error) {
        return res.json({
            status: 500,
            error
        });
    }
})

module.exports = Router