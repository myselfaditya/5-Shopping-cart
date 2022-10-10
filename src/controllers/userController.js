const userModel = require("../model/userModel")

const { isValidMail, isValid, isValidName, isValidRequestBody, isValidfield, isValidMobile, isValidPassword} = require("../validator/validation")


const createUser = async function(req, res){
    try{
        
        let data = req.body


    }
    catch(err){

    }
}
module.exports = { createUser}