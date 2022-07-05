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