const userModel = require("../model/userModel")
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId.isValid

const { isValidMail, isValid, isValidName, isValidRequestBody,isValidMobile, isValidPassword, imgUrl, validPin } = require("../validator/validation")

const createUser = async function (req, res) {
    try {
        let data = req.body
        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "body cant't be empty Please enter some data." })

        const { fname, lname, email, profileImage, phone, password, address } = data

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is  required" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email id is required" })
        if (!isValid(profileImage)) return res.status(400).send({ status: false, message: "profileImage is required" })
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })

        if (!isValidName.test(fname)) return res.status(406).send({
            status: false, message: "Enter a valid fname",
            validname: "length of f-name has to be in between (3-20), use only String "
        })
        if (!isValidName.test(lname)) return res.status(406).send({
            status: false, message: "Enter a valid lastname",
            validname: "length of L-name has to be in between (3-20), use only String "
        })
        if (!isValidMail.test(email)) return res.status(406).send({
            status: false, message: "email id is not valid",
            ValidMail: "email must be in for e.g. xyz@abc.com format."
        })
        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) return res.status(400).send({ status: false, message: "email Id Already Exists." })

        if (!imgUrl.test(profileImage)) return res.status(400).send({ status: false, message: "please provide profileImage link in correct format"})

        if (!isValidMobile.test(phone)) return res.status(406).send({
            status: false, message: "mobile no. is not valid",
            ValidMobile: "it must be 10 digit Number & it should be a indian mobile no."
        })
        let uniquePhone = await userModel.findOne({ phone: phone })
        if (uniquePhone) return res.status(400).send({ status: false, message:"phone no. Already Exists."})

        // if (!isValidPassword(password)) return res.status(406).send({
        //     status: false, message: "enter valid password  ",
        //     ValidPassWord: "passWord in between(8-15)& must be contain ==> upperCase,lowerCase,specialCharecter & Number"
        // })

        if (!isValid(address)) return res.status(400).send({ status: false, message: "address is required" })
        if (typeof address != "object") return res.status(400).send({ status: false, message: "Address body  should be in object form" });
        if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address cant't be empty Please enter some data." })

        if (typeof address.shipping != "object") return res.status(400).send({ status: false, message: "Shipping Address body  should be in object form" });
        if (!isValidRequestBody(address.shipping)) return res.status(400).send({ status: false, message: "Shipping address cant't be empty Please enter some data." })
        if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "please enter Shipping street " })
        if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "please enter Shipping city" })
        if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter Shipping pincode" })
        if (!validPin.test(address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valied Shipping pincode "})

        if (typeof address.billing != "object") return res.status(400).send({ status: false, message: "billing Address body  should be in object form" });
        if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "billing address cant't be empty Please enter some data." })
        if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "please enter billing street " })
        if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "please enter billing city" })
        if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter billing pincode"})
        if (!validPin.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valied billing pincode "})

        const userData = { fname, lname, email, profileImage, phone, password, address }
        let savedData = await userModel.create(userData)
        res.status(201).send({ status: true, message: "Success", data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const login = async function(req, res){
    try {
		const body = req.body

		const { email, password } = body

	
		if (!email) return res.status(400).send({ status: false, message: "Email is mandatory" })
		if (!isValidMail.test(email)) return res.status(400).send({ status: false, message: "Invalid email, ex.- ( abc123@gmail.com )" })

		// if (!password) return res.status(400).send({ status: false, message: "Password is mandatory" })
		// if (!/^(?!.* )(?=.*[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#!@$%^&*()+=]).{8,15}$/.test(password)) return res.status(400).send({ status: false, message: "Password is mandatory" })

		let userInDb = await userModel.findOne({ email: email, password: password, isDeleted: false });
		if (!userInDb) return res.status(401).send({ status: false, message: "invalid credentials (email or the password is not corerct)" })

		let token = jwt.sign(
			{
				userId: userInDb._id.toString(),
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 ), // After 24 hours it will expire //Date.now() / 1000 => second *60
				iat: Math.floor(Date.now() / 1000)
			}, "secret code");

		// res.setHeader("x-api-key", token);
		

		let data = {
			token: token,
			userId: userInDb._id.toString()

		}
		res.status(201).send({ status: true, message: "Token has been successfully generated.", data: data });
	}
	catch (err) {
		console.log("This is the error :", err.message)
		res.status(500).send({ status: false, message: "Error", error: err.message })
	}

}


const getUser = async function(req, res){
	try {
        let userId = req.params.userId

        if (!ObjectId(userId)) return res.status(400).send({ status: false, message: " Invalid userId" })

        let user = await userModel.findOne({ _id: userId, isDeleted: false })

        if (!user) return res.status(404).send({ status: false, message: "user is not found" })

        let obj = user._doc
        
        res.status(200).send({ status: true, message: "Register user", data: obj })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}














module.exports = { createUser, login, getUser }