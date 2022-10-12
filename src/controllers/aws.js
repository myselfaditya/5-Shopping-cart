const aws= require("aws-sdk")


//=================================================AWS COnfig ===============================================================
aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) { 
    let s3= new aws.S3({apiVersion: '2006-03-01'});                                   

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname,  
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        return resolve(data.Location)
    })

   })
}


// const imageUpload = async(req,res) =>{
//     try{
//         let files= req.files
//         if(files && files.length>0){
//             let url = await uploadFile( files[0] )
//             res.status(201).send({status: true, message: "file uploaded succesfully", URLofImage:url})
//         }
//         else{
//             res.status(400).send({status: false, message: "No file found" })
//         }
        
//     }
//     catch(err){
//         res.status(500).send({status: false, message: err})
//     }
// }


module.exports = {uploadFile}