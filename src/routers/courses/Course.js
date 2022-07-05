const express = require('express')

const multer = require('multer')

const { s3Uploadv2 } = require('../../config/_S3Service')
const { createDynamoDBv2, scanDynamoDBv2, scanDynamoByIDv2, updateDynamoByID, deleteDynamoByID } = require('../../config/DynamoService')
const { verifyToken, is_super_user } = require('../../middlewares/CreateToken')

const Router = express.Router()

// store files in a folder in s3 storage
const storage = multer.memoryStorage()

const upload = multer({ storage })

const multiPart = upload.fields([
    { name: "courseVideo" },
    { name: "courseFile" },
    { name: "thumbnail" }
])

// baseurl/v1/lms/course/ -> post route
Router.post('/', verifyToken, is_super_user, multiPart, async (req, res) => {
    const getBodyObj = req.body
    const convertToArray = Object.values(req.files)
    try {
        // check if file field is missing
        if (typeof getBodyObj.courseTitle === 'undefined' || typeof getBodyObj.description === 'undefined' || typeof getBodyObj.instructor === 'undefined' || typeof convertToArray[2] === 'undefined' || typeof convertToArray[0] === 'undefined' || typeof convertToArray[1] === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.courseTitle == '' || getBodyObj.description == '' || getBodyObj.instructor == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        // map through the course file array
        let courseFile = convertToArray[0].map(item => {
            return item
        })

        if (courseFile.length > 1) {
            return res.json({
                status: 400,
                message: 'Bad Request, file should not be more than 1'
            })
        }

        // loop through the course file mimetype
        for (let i = 0; i < courseFile.length; i++) {
            // check if the mimetype is document
            // check if the size is > 2m
            if (courseFile[i].mimetype.split('/')[0] !== 'application' || courseFile[i].size > 2001268) {
                return res.json({
                    status: 400,
                    message: 'Bad Request, file type is not a document, or is too large'
                })
            }
        }

        // map through the course file array
        let thumbnail = convertToArray[1].map(item => {
            return item
        })

        // check the lenght of thumbnail and the size
        if (thumbnail.length > 1 || thumbnail[0].mimetype.split('/')[0] !== 'image' || thumbnail[0].size > 5001268) {
            return res.json({
                status: 400,
                message: 'Bad Request, thumbnail is more than one or not an image or greather than 5mb'
            })
        }

        // map through the course file array
        let courseVideo = convertToArray[2].map(item => {
            return item
        })

        if (courseVideo.length > 1) {
            return res.json({
                status: 400,
                message: 'Bad Request, video should not be more than 1'
            })
        }

        // loop through the course video mimetype
        for (let i = 0; i < courseVideo.length; i++) {
            // check if the mimetype is video
            // check if the size is > 90mb
            if (courseVideo[i].mimetype.split('/')[0] !== 'video' || courseVideo[i].size > 50001268) {
                return res.json({
                    status: 400,
                    message: 'Bad Request, file type is not a video, or is too large'
                })
            }
        }

        // store files in s3
        const getFileObj = await s3Uploadv2(convertToArray)
        // persist data on dynamo DB
        await createDynamoDBv2(getFileObj, getBodyObj)
        // success msg
        return res.json({
            status: 201,
            message: "succesfully uploaded"
        })
    } catch (error) {
        return res.json({
            status: 500,
            error
        })
    }
})

// baseurl/v1/lms/course/ -> route for get
Router.get('/', verifyToken, async (req, res) => {
    try {
        // get the scan result
        let scanResult = await scanDynamoDBv2()
        // check if items are null, or not an array or no items
        if (scanResult.Items === null || !Array.isArray(scanResult.Items) || scanResult.Items.length === 0) {
            res.json({
                status: 404,
                message: 'No Item found'
            })
        } else {

            // send response to client
            res.json({ status: 200, message: "success", data: scanResult })
        }
    } catch (error) {
        res.json({
            status: 500,
            error
        });
    }
})

// baseurl/v1/lms/course/:id -> get item by id
Router.get('/:id', verifyToken, async (req, res) => {
    const getItemID = req.params.id

    try {

        //dynamodb scan by id
        const result = await scanDynamoByIDv2(getItemID)
        // check if item is null
        if (result.Item === null) {
            res.json({
                status: 404,
                message: 'No Item found',
            });
        }
        // check if item is undefined
        else if (result.Item === undefined || !getItemID) {
            res.json({
                status: 400,
                message: 'undefined parameters'

            });
        } else {
            // onsuccess
            res.json({
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

// baseurl/v1/lms/course/:id -> update item by id
Router.put('/:id', verifyToken, is_super_user, multiPart, async (req, res) => {

    const getBodyObj = req.body
    const convertToArray = Object.values(req.files)

    const getItemID = req.params.id

    try {

        // check if file field is missing
        if (typeof getBodyObj.courseTitle === 'undefined' || typeof getBodyObj.description === 'undefined' || typeof getBodyObj.instructor === 'undefined' || typeof convertToArray[2] === 'undefined' || typeof convertToArray[0] === 'undefined' || typeof convertToArray[1] === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.courseTitle == '' || getBodyObj.description == '' || getBodyObj.instructor == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        // map through the course file array
        let courseFile = convertToArray[0].map(item => {
            return item
        })

        if (courseFile.length > 1) {
            return res.json({
                status: 400,
                message: 'Bad Request, file should not be more than 1'
            })
        }

        // loop through the course file mimetype
        for (let i = 0; i < courseFile.length; i++) {
            // check if the mimetype is document
            // check if the size is > 2m
            if (courseFile[i].mimetype.split('/')[0] !== 'application' || courseFile[i].size > 2001268) {
                return res.json({
                    status: 400,
                    message: 'Bad Request, file type is not a document, or is too large'
                })
            }
        }

        // map through the course file array
        let thumbnail = convertToArray[1].map(item => {
            return item
        })

        // check the lenght of thumbnail and the size
        if (thumbnail.length > 1 || thumbnail[0].mimetype.split('/')[0] !== 'image' || thumbnail[0].size > 5001268) {
            return res.json({
                status: 400,
                message: 'Bad Request, thumbnail is more than one or not an image or greather than 5mb'
            })
        }

        // map through the course file array
        let courseVideo = convertToArray[2].map(item => {
            return item
        })

        if (courseVideo.length > 1) {
            return res.json({
                status: 400,
                message: 'Bad Request, video should not be more than 1'
            })
        }

        // loop through the course video mimetype
        for (let i = 0; i < courseVideo.length; i++) {
            // check if the mimetype is video
            // check if the size is > 90mb
            if (courseVideo[i].mimetype.split('/')[0] !== 'video' || courseVideo[i].size > 50001268) {
                return res.json({
                    status: 400,
                    message: 'Bad Request, file type is not a video, or is too large'
                })
            }
        }


        // store files in s3
        const getFileObj = await s3Uploadv2(convertToArray)
        // persist data on dynamo DB
        await updateDynamoByID(getItemID, getBodyObj, getFileObj)
        // await createDynamoDBv2(getFileObj, getBodyObj)

        // success msg
        return res.json({
            status: 201,
            message: "succesfully uploaded"
        })

    } catch (error) {
        res.json({
            status: 500,
            error
        });
    }

})

// baseurl/v1/lms/course/:id -> delete item by id
Router.delete('/:id', verifyToken, is_super_user, async (req, res) => {
    const getItemID = req.params.id

    try {
        // dynamodb delete item from table
        await deleteDynamoByID(getItemID)

        res.json({
            status: 200,
            message: 'successfully deleted'
        })

    } catch (error) {
        res.json({
            status: 500,
            error
        });
    }
})

module.exports = Router