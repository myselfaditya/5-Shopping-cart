const jwt = require('jsonwebtoken')
const userModel = require("../model/userModel")
const mongoose = require('mongoose')


const authentication = function (req, res, next) {
    try {
        let bearerHeader = req.headers.authorization;
        if (typeof bearerHeader == "undefined") {
            return res.status(401).send({ status: false, message: "Token is missing! please enter token." });
        }
        let bearerToken = bearerHeader.split(' '); // converting it to array 
        let token = bearerToken[1];
        jwt.verify(token, "secret code group 19", function (error, data) {
            if (error && error.message == "jwt expired") {
                return res.status(401).send({ status: false, message: "Session expired! Please login again." })
            }
            if (error) {
                return res.status(401).send({ status: false, message: "Incorrect token" })
            }
            else {
                req.decodedToken = data.userId;

                next()
            }
        });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}


let authorization = async function (req, res, next) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: " userId is not a valid ObjectId" })
        }
        let token = req.header("Authorization").split(' ')[1]
        let decodedToken = jwt.verify(token, "secret code group 19")
        let userDetails = await userModel.findOne({ _id: userId })
        if (!userDetails) { 
            return res.status(404).send({ status: false, msg: "id not found" })
        }
        if (decodedToken.userId != userDetails._id) {
            return res.status(403).send({ status: false, msg: "you are not authorized" })
        }
        next()
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error })
    }
}


module.exports = { authentication, authorization }