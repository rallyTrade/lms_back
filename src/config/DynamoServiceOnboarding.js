const AWS = require('aws-sdk')
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const notification = new AWS.SES()

// make this fuction visible to be used
exports.onboardingDynamoDBv2 = async (files) => {
    
    let createdAt = new Date().toISOString();

    // check if staff id already exist in the db
    let queryParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV_DEV,
        FilterExpression: 'staff_id = :staff_id',
        ExpressionAttributeValues: {
            ':staff_id': files.staff_id,
        },
    };

    const staffExist = await dynamo.scan(queryParams).promise();
    const filterItem = staffExist.Items.filter(staffID => staffID.staff_id == files.staff_id)

    if (staffExist.Items.length < 1 || filterItem[0].staff_id !== files.staff_id) {

        // collect form data field
        // make a post to the dynamo db
        let putParams = {
            TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
            Item: {
                id: uuidv4(),
                staff_id: files.staff_id,
                email: files.email,
                first_name: files.first_name,
                last_name: files.last_name,
                password: files.password,
                super_user: false,
                score_count: 0,
                createdAt: createdAt
            }
        };

        // promisify the form data and return it
        return await dynamo.put(putParams).promise()

    } else {
        return null
    }
}

// get staff id to update there score
exports.updateScores = async (id, bodyObj) => {

    let updateParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        Key: {
            id
        },
        // set attribute to update
        UpdateExpression: 'SET #score_count = :score_count',
        ExpressionAttributeNames: {
            '#score_count': 'score_count'
        },
        ExpressionAttributeValues: {
            ':score_count': bodyObj.score_count
        },
        ReturnValue: 'ALL_NEW'
    };

    await dynamo.update(updateParams).promise();
}

// get list of staff
exports.scanDynamoDBOnboardingv2 = async () => {

    let scanParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV
    };

    return await dynamo.scan(scanParams).promise();
}

// scand dynamo db by id
// get staff by id
exports.scanDynamoByIDv2 = async (id) => {
    let getParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        Key: {
            id
        }
    };

    return await dynamo.get(getParams).promise();
}

exports.updateStaffInfo = async (id, bodyObj) => {
    // add password alt
    const salt = await bcrypt.genSalt()
    // hash password before stturing it to db
    const hashPwd = await bcrypt.hash(bodyObj.password, salt)

    let getParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        Key: {
            id
        },
        // set attribute to update
        UpdateExpression: 'SET #first_name = :first_name, #last_name = :last_name, #password = :password',
        ExpressionAttributeNames: {
            '#first_name': 'first_name',
            '#last_name': 'last_name',
            '#password': 'password'
        },
        ExpressionAttributeValues: {
            ':first_name': bodyObj.first_name,
            ':last_name': bodyObj.last_name,
            ':password': hashPwd,
        },
        ReturnValue: 'ALL_NEW'
    };

    return await dynamo.update(getParams).promise();
}

// query database to find user with a specific staff id and password
exports.queryOnboardingUser = async (bodyObj) => {
    const pwd = bodyObj.password
    let queryParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        FilterExpression: 'staff_id = :staff_id',
        ExpressionAttributeValues: {
            ':staff_id': bodyObj.staff_id,
        },
    };
    // get loop tru the db
    const result = await dynamo.scan(queryParams).promise();

    if (!result.Items[0].password) {
        return null
    } else {
        // decode and compare password
        const comparePwd = await bcrypt.compare(pwd, result.Items[0].password)

        return {
            getID: result.Items[0],
            comparePwd
        }
    }

}

// remove staff from LMS
exports.deleteDynamoByIDOnboarding = async (id) => {
    // query table
    let delParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        Key: {
            id
        }
    };

    return await dynamo.delete(delParams).promise();
}

exports.forgotPassword = async (emailTo) => {

    let queryParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE_ONBOARD_DEV,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': emailTo,
        },
    };

    // get loop tru the db
    return await dynamo.scan(queryParams).promise();

}

exports.notification = async (emailTo, message) => {

    let snsParams = {
        Destination: {
            ToAddresses: [
                emailTo,
                /* more items */
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: `${message}`
                }
            },
            Subject: { Data: 'Password reset' }
        },

        Source: "ikechukwu.boniface@rally.trade"

    }

    return await notification.sendEmail(snsParams).promise()

}