const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();

// make this fuction visible to be used
exports.createDynamoDBQuiz = async (quiz) => {
    let createdAt = new Date().toISOString();

    // collect form data field
    // make a post to the dynamo db
    let putParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_QUIZ_DEV,
        Item: {
            id: uuidv4(),
            createdAt: createdAt,
            questions: {
                question: quiz.question,
                type: quiz.type,
                answers: quiz.answers
            }

        }
    };

    // promisify the form data and return it
    return await dynamo.put(putParams).promise()
}

exports.scanDynamoDBQuiz = async () => {

    let scanParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_QUIZ_DEV
    };

    // promisify the form data and return it
    return await dynamo.scan(scanParams).promise()
}

exports.updateDynamoDBQuiz = async (id, bodyObj) => {
    let updateParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_QUIZ_DEV,
        Key: {
            id
        },
        // set attribute to update
        UpdateExpression: 'SET #questions.#question = :question, #questions.#type = :type, #questions.#answers = :answers',
        ExpressionAttributeNames: {
            '#questions': 'questions',
            '#question': 'question',
            '#type': 'type',
            '#answers': 'answers'
        },
        ExpressionAttributeValues: {
            ':question': bodyObj.question,
            ':type': bodyObj.type,
            ':answers': bodyObj.answers
        },
        ReturnValue: 'ALL_NEW'
    };

    await dynamo.update(updateParams).promise();
}

// delete item by id from dynamo db
exports.deleteDynamoByIDQuiz = async (id) => {

    let delParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_QUIZ_DEV,
        Key: {
            id
        }
    };

    return await dynamo.delete(delParams).promise();

}