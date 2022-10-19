const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel")
const mongoose = require('mongoose')

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

        let userInDb = await userModel.findOne({ userId: userId })

        if (!userInDb) return res.status(404).send({ status: false, message: "User not found" })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

        let userInDb = await userModel.findOne({ userId: userId })

        if (!userInDb) return res.status(404).send({ status: false, message: "User not found" })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createOrder, updateOrder }