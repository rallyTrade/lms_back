const express = require('express')

const Router = express.Router()

const { createDynamoDBQuiz, scanDynamoDBQuiz, updateDynamoDBQuiz, deleteDynamoByIDQuiz } = require('../../config/DynamoServiceQuiz')

const { verifyToken, is_super_user } = require('../../middlewares/CreateToken')

// baseurl/v1/lms/quiz -> route for get
Router.post('/', verifyToken, is_super_user, async (req, res) => {
    const getBodyObj = req.body
    const lpAnswers = getBodyObj.answers

    try {
        // check if file field is missing
        if (typeof getBodyObj.question === 'undefined' || typeof getBodyObj.type === 'undefined' || typeof getBodyObj.answers === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.question == '' || getBodyObj.type == '' || getBodyObj.answers == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        // loop through the course file mimetype
        for (let i = 0; i < lpAnswers.length; i++) {
            // check if the mimetype is document
            // check if the size is > 2m
            if (typeof lpAnswers[i].text === 'undefined' || lpAnswers[i].text == '') {
                return res.json({
                    status: 400,
                    message: 'Bad Request, missing parameters or an empty field'
                });
            }
        }

        await createDynamoDBQuiz(getBodyObj)

        res.json({
            status: 201,
            message: 'Quiz successfully created'
        })
    } catch (error) {
        res.json({
            status: 500,
            error
        })
    }
})


// baseurl/v1/lms/quiz -> route for get
Router.get('/', verifyToken, async (req, res) => {

    function shuffle(array) {
        let arrItems = array.Items
        let currentIndex = arrItems.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [arrItems[currentIndex], arrItems[randomIndex]] = [
                arrItems[randomIndex], arrItems[currentIndex]];
        }

        return arrItems;
    }

    try {
        // get the scan result
        let scanResult = await scanDynamoDBQuiz()
        // check if items are null, or not an array or no items
        if (scanResult.Items === null || !Array.isArray(scanResult.Items) || scanResult.Items.length === 0) {
            res.json({
                status: 404,
                message: 'No Item found'
            })
        } else {

            const randomQuestions = scanResult
            shuffle(randomQuestions)
           
            // send response to client
            res.json({ status: 200, message: "success", data: randomQuestions })
        }
    } catch (error) {
        res.json({
            status: 500,
            error
        });
    }
})

// baseurl/v1/lms/quiz/:id -> route for get
Router.put('/:id', verifyToken, async (req, res) => {
    const getBodyObj = req.body
    const lpAnswers = getBodyObj.answers
    const getItemID = req.params.id

    try {
        // check if file field is missing
        if (typeof getBodyObj.question === 'undefined' || typeof getBodyObj.type === 'undefined' || typeof getBodyObj.answers === 'undefined') {
            return res.json({
                status: 400,
                message: 'Bad Request, missing parameters'
            });
        }

        // check if fields are empty
        if (getBodyObj.question == '' || getBodyObj.type == '' || getBodyObj.answers == '') {
            return res.json({
                status: 400,
                message: 'Bad Request, Empty field detected'
            })
        }

        // loop through the course file mimetype
        for (let i = 0; i < lpAnswers.length; i++) {
            // check if the mimetype is document
            if (typeof lpAnswers[i].text === 'undefined' || lpAnswers[i].text == '') {
                return res.json({
                    status: 400,
                    message: 'Bad Request, missing parameters or an empty field'
                });
            }
        }

        await updateDynamoDBQuiz(getItemID, getBodyObj)

        res.json({
            status: 201,
            message: 'Quiz successfully updated'
        })
    } catch (error) {
        res.json({
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
        await deleteDynamoByIDQuiz(getItemID)

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