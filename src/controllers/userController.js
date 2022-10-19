const userModel = require("../model/userModel")
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { uploadFile } = require("./aws")


const { isValidMail, isValid, isValidName, isValidRequestBody, isValidMobile, isValidPassword, validPin, validString } = require("../validator/validation")

const createUser = async function (req, res) {
    try {
        let data = req.body 

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "body cant't be empty Please enter some data." })

        let { fname, lname, email, phone, password, address, profileImage } = data

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is  required" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email id is required" })
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValid(address)) return res.status(400).send({ status: false, message: "address is required" })

        if (!isValidName.test(fname)) return res.status(406).send({
            status: false, message: "Enter a valid fname",
            validname: "length of f-name has to be in between (3-20), use only String"
        })
        if (!isValidName.test(lname)) return res.status(406).send({
            status: false, message: "Enter a valid lastname",
            validname: "length of L-name has to be in between (3-20), use only String "
        })
        if (!isValidMail.test(email)) return res.status(406).send({
            status: false, message: "email id is not valid",
            ValidMail: "email must be in correct format for e.g. xyz@abc.com"
        })
        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) return res.status(400).send({ status: false, message: "email Id Already Exists." })

        let files = req.files
        if (files.length == 0) return res.status(400).send({ status: false, msg: "profileImage is mandatory" })
        let ImageLink = await uploadFile(files[0]) // using aws for link creation 
      
        profileImage = ImageLink

        if (!isValidMobile.test(phone)) return res.status(406).send({
            status: false, message: "mobile no. is not valid",
            ValidMobile: "it must be 10 digit Number & it should be a indian mobile no."
        })
        let uniquePhone = await userModel.findOne({ phone: phone })
        if (uniquePhone) return res.status(400).send({ status: false, message: "phone no. Already Exists." })

        if (!isValidPassword(password)) return res.status(406).send({
            status: false, message: "passWord should be in between(8-15) & must be contain upperCase, lowerCase, specialCharecter & Number",
        })
        let newPassword = await bcrypt.hash(password, 10) //using bcrypt for password hashing
        password = newPassword

        if (typeof address != "object") return res.status(400).send({ status: false, message: "Address body  should be in object form" });
        if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address cant't be empty Please enter some data." })

        if (typeof address.shipping != "object") return res.status(400).send({ status: false, message: "Shipping Address body should be in object form" });
        if (!isValidRequestBody(address.shipping)) return res.status(400).send({ status: false, message: "Shipping address cant't be empty Please enter some data." })
        if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "please enter Shipping street " })
        if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "please enter Shipping city" })
        if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter Shipping pincode" })
        if (!validPin.test(address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valied Shipping pincode " })

        if (typeof address.billing != "object") return res.status(400).send({ status: false, message: "billing Address body  should be in object form" });
        if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "billing address cant't be empty Please enter some data." })
        if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "please enter billing street " })
        if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "please enter billing city" })
        if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter billing pincode" })
        if (!validPin.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valied billing pincode " })

        const userData = { fname, lname, email, phone, password, address, profileImage }
        let savedData = await userModel.create(userData)
        res.status(201).send({ status: true, message: "Success", data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const login = async function (req, res) {
    try {
        const body = req.body
        const { email, password } = body

        if (!isValid(email)) return res.status(400).send({ status: false, message: "email id is required" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValidMail.test(email)) return res.status(400).send({ status: false, message: "email must be in correct format for e.g. xyz@abc.com" })

        let userInDb = await userModel.findOne({ email: email });
        if (!userInDb) return res.status(401).send({ status: false, message: "email or password is not corerct" })

        const validPassword = await bcrypt.compare(password, userInDb.password)
        if (!validPassword) {
            return res.status(400).send({ status: false, message: "wrong password" })
        }

        let token = jwt.sign(
            {
                userId: userInDb._id.toString(),
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // After 24 hours it will expire //Date.now() / 1000 => second *60
                iat: Math.floor(Date.now() / 1000)
            }, "secret code group 19");

        let data = {
            userId: userInDb._id.toString(),
            token: token
        }
        res.status(201).send({ status: true, message: "Login successfully", data: data });
    }
    catch (err) {
        console.log("catch error :", err.message)
        res.status(500).send({ status: false, message: "Error", error: err.message })
    }

}

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let user = await userModel.findOne({ _id: userId })

        if (!user) return res.status(404).send({ status: false, message: "user not found" })

        res.status(200).send({ status: true, message: "Register user", data: user })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let userDb = await userModel.findById(userId)

        if (!userDb) return res.status(404).send({ status: false, messgage: 'user not found' })

        let files = req.files

        if(!isValid(files)) return res.status(400).send({status:false,message:"Please provide data to update the user"})

        const body = req.body

        let { fname, lname, email, profileImage, phone, password, address } = body

        let data = {} //storing object
        
        if (!validString(fname)) return res.status(400).send({ status: false, message: "fname not be empty" });
        if (fname) {
            if (!isValidName.test(fname)) return res.status(406).send({ status: false, message: "Enter a valid fname" })
            data.fname = fname
        }

        if (!validString(lname)) return res.status(400).send({ status: false, message: "lname not be empty" })
        if (lname) {
            if (!isValidName.test(lname)) return res.status(406).send({ status: false, message: "Enter a valid lname" })
            data.lname = lname
        }
 

        if (!validString(email)) return res.status(400).send({ status: false, message: "email not be empty" });
        if (email) {
            if (!isValidMail.test(email)) return res.status(400).send({ status: false, message: "email must be in correct format for e.g. xyz@abc.com" })
            let uniqueEmail = await userModel.findOne({ email: email })
            if (uniqueEmail) return res.status(400).send({ status: false, message: "email Id Already Exists." })
            data.email = email
        }


        if (profileImage) {
        if(!validString(profileImage)) return res.status(400).send({ status: false, message: "Profile Image should not be Empty" })
            let ImageLink = await uploadFile(files[0])
            data.profileImage = ImageLink
        }
 

        if (!validString(phone)) return res.status(400).send({ status: false, message: "phone not be empty" });
        if (phone) {
            if (!isValidMobile.test(phone)) return res.status(400).send({ status: false, message: "email must be in correct format for e.g. xyz@abc.com" })
            let uniquePhone = await userModel.findOne({ email: email })
            if (uniquePhone) return res.status(400).send({ status: false, message: "email Id Already Exists." })
            data.phone = phone
        }


        if (!validString(password)) return res.status(400).send({ status: false, message: "password not be empty" });
        if (password) {
            if (!isValidPassword(password)) return res.status(406).send({
                status: false, message: "passWord should be in between(8-15) & must be contain upperCase, lowerCase, specialCharecter & Number",
            })
            let newPassword = await bcrypt.hash(password, 10)
            data.password = newPassword
        }


        if (!validString(address)) return res.status(400).send({ status: false, message: "address not be empty" });
        if (address) {
            data.address = userDb.address
            let addressIn=JSON.parse(address)
 
            if (addressIn.shipping) {
                if (!isValidRequestBody(addressIn.shipping)) return res.status(400).send({ status: false, message: "Shipping address cant't be empty Please enter some data." })
                if (!validString(addressIn.shipping.street)) return res.status(400).send({ status: false, message: "please enter Shipping street " })
                if(addressIn.shipping.street){
                data.address.shipping.street = addressIn.shipping.street
                }
                
                if (!validString(addressIn.shipping.city)) return res.status(400).send({ status: false, message: "please enter Shipping city" })
                if(addressIn.shipping.city){
                    data.address.shipping.city = addressIn.shipping.city
                }

                
                if (!validString(addressIn.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter Shipping pincode" })
                if (!validPin.test(addressIn.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valied Shipping pincode " })
                if(addressIn.shipping.pincode){
                    data.address.shipping.pincode = addressIn.shipping.pincode
                }               
            }

            if (addressIn.billing) {
                if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "billing address cant't be empty Please enter some data." })
                if (!validString(address.billing.street)) return res.status(400).send({ status: false, message: "please enter billing street " })
                if(addressIn.billing.street){
                    data.address.billing.street = addressIn.billing.street
                }
                
                if (!validString(address.billing.city)) return res.status(400).send({ status: false, message: "please enter billing city" })
                if(addressIn.billing.city){
                    data.address.billing.city = addressIn.billing.city
                }
                
                if (!validString(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter billing pincode" })
                if (!validPin.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valied billing pincode " })
                if(addressIn.billing.pincode){
                    data.address.billing.pincode = addressIn.billing.pincode
                }

            }
        }

        const user = await userModel.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })

        if (!user) return res.status(404).send({ status: false, message: "User not found" })

        res.status(200).send({ Status: true, message: "User updated Successfully", Data: user })

    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}












module.exports = { createUser, login, getUser, updateUser }