const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();

// make this fuction visible to be used
exports.createDynamoDBv2 = async (files, text) => {
    let createdAt = new Date().toISOString();
    // collect form data field
    // make a post to the dynamo db
    let putParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_DEV_DEV,
        Item: {
            id: uuidv4(),
            courseFile: [files[0].Location], //course file field s3 url
            courseTitle: text.courseTitle,
            description: text.description,
            instructor: text.instructor,
            thumbnail: files[1].Location, //video thumbnail field s3 url
            completed: 0,
            courseVideo: [files[2].Location], //video field s3 url
            createdAt: createdAt
        }
    };
    // promisify the form data and return it
    return await dynamo.put(putParams).promise()
}

// scan function visible
exports.scanDynamoDBv2 = async () => {
    let scanParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_DEV,
    }
    // scan the database
    return await dynamo.scan(scanParams).promise()
}

// scand dynamo db by id
exports.scanDynamoByIDv2 = async (id) => {
    let getParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_DEV,
        Key: {
            id
        }
    };

    return await dynamo.get(getParams).promise();
}

// update dynamo db by id
exports.updateDynamoByID = async (id, bodyObj, files) => {
    let updateParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_DEV,
        Key: {
            id
        },
        // set attribute to update
        UpdateExpression: 'SET #description = :description, #instructor = :instructor, #thumbnail = :thumbnail, #courseVideo = list_append(if_not_exists(#courseVideo, :empty_list), :courseVideo), #courseFile = list_append(if_not_exists(#courseFile, :empty_list), :courseFile)',
        ExpressionAttributeNames: {
            '#description': 'description',
            '#instructor': 'instructor',
            '#thumbnail': 'thumbnail',
            '#courseVideo': 'courseVideo',
            '#courseFile': 'courseFile'
        },
        ExpressionAttributeValues: {
            ':description': bodyObj.description,
            ':instructor': bodyObj.instructor,
            ':thumbnail': files[1].Location,
            ':courseVideo': [files[2].Location],
            ':courseFile': [files[0].Location],
            ':empty_list': []
        },
        ReturnValue: 'ALL_NEW'
    };

    await dynamo.update(updateParams).promise();
}

// delete item by id from dynamo db
exports.deleteDynamoByID = async (id) => {

    let delParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_DEV,
        Key: {
            id
        }
    };

    return await dynamo.delete(delParams).promise();

}