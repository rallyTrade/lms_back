const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.createDynamoDBv2 = async (files, text) => {
    let createdAt = new Date().toISOString();

    let putParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE,
        Item: {
            id: uuidv4(),
            courseFile: files[0].Location, //course file field s3 url
            courseTitle: text.courseTitle,
            description: text.description,
            instructor: text.instructor,
            thumbnail: files[1].Location, //video thumbnail field s3 url
            completed: 0,
            courseVideo: files[2].Location, //video field s3 url
            createdAt: createdAt
        }
    };

    return await dynamo.put(putParams).promise()
}

exports.scanDynamoDBv2 = async () => {
    let scanParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE,
    }

    return await dynamo.scan(scanParams).promise()
}