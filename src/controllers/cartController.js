const cartModel = require("../model/cartModel")
const mongoose = require('mongoose')

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, updateCart, getCart, deleteCart }