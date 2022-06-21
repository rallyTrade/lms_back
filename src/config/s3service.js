const { S3 } = require('aws-sdk')

exports.s3Uploadv2 = async (files) => {
    const s3 = new S3();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)


    const params = files.map((file) => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'uploads/' + uniqueSuffix + '-' + file[0].originalname,
            Body: file[0].buffer
        }
    })

    return await Promise.all(
        params.map((param) => s3.upload(param).promise())
    );

} 

exports.dynamoDB = async (filesObj) => {

    let putParams = {
        TableName: process.env.DYNAMODB_LMS_TABLE,
        Item: {
            courseID: uuidv4(),
            courseFile: await uploadPresignToS3(bodyObj.courseFile),
            courseTitle: bodyObj.courseTitle,
            description: bodyObj.description,
            instructor: bodyObj.instructor,
            thumbnail: await uploadFileToS3(thumbnailName, buff1),
            completed: 0,
            courseVideo: bodyObj.courseVideo,
            createdAt: createdAt
        }
    };
    
}