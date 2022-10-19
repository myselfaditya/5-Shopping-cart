const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const mongoose = require('mongoose')

const { isValidRequestBody, isValid, isValidNumber } = require("../validator/validation")



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
        let body = req.body
        let { cartId, productId, removeProduct } = body
        if (!isValidRequestBody(body)) return res.status(400).send({ status: false, message: "body cant't be empty Please enter some data" });

        if (!(cartId && removeProduct && productId)) {
            return res.status(400).send({ status: false, message: "enter valid keys to update cart i.e cartId,removeProduct,productId" })
        }

        let cartExist = await cartModel.findOne({ userId: userId })
        if (!cartExist) {
            return res.status(404).send({ status: false, message: `No cart found` });
        }

        if (cartId) {
            if (!mongoose.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "provide valid cartId" });
            }
            if (cartExist._id.toString() != body.cartId) {
                return res.status(400).send({ status: false, message: `this cart belong to different user` });
            }
        }

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "provide valid productId" });
        }

        let findProduct = await productModel.findById(body.productId)
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }

        let productArr = cartExist.items.filter(cart => cart.productId.toString() == data.productId)
        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "product is not present in the cart" })
        }

        let indexNumber = cartExist.items.indexOf(productArr[0])

        if (removeProduct) {
            if (isValidNumber(removeProduct)) {
                if (!(removeProduct == 0 || removeProduct == 1)) {
                    return res.status(400).send({ status: false, message: "removeProduct can either be 0 or 1" })
                }
                if (removeProduct == 0) {
                    cartExist.totalPrice = (cartExist.totalPrice - (findProduct.price * cartExist.items[indexNumber].quantity)).toFixed(2)
                    cartExist.items.splice(indexNumber, 1)
                    cartExist.totalItems = cartExist.items.length
                    await cartExist.save()
                    await cartExist.populate({ path: "items.productId", select: { _id: 1 } })
                }
                if (removeProduct == 1) {
                    cartExist.items[indexNumber].quantity -= 1;
                    cartExist.totalPrice = (cartExist.totalPrice - findProduct.price).toFixed(2)
                    if (cartExist.items[indexNumber].quantity == 0) {
                        cartExist.items.splice(indexNumber, 1)
                    }
                    cartExist.totalItems = cartExist.items.length
                    await cartExist.save()
                    await cartExist.populate({ path: "items.productId", select: { _id: 1 } })
                }
            }
            else {
                return res.status(400).send({ status: false, message: "Product removed only as a number" })
            }
        }
        return res.status(200).send({ status: true, message: "Cart updated Successfully", data: cartExist })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

        let userInDb = await userModel.findOne({ userId: userId })
        if (!userInDb) return res.status(404).send({ status: false, message: "User not found" })
       
        let cartInDb = await cartModel.findOne({ userId: userId }).populate({ path: "items.productId", select: { title: 1, price: 1, productImage: 1, availableSizes: 1 } })
        if (!cartInDb) return res.status(404).send({ status: false, message: "Cart not found" })

        return res.status(200).send({ status: true, message: "Success", data: cartInDb })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "provie valid userId" })

        let userInDb = await userModel.findOne({ userId: userId })
        if (!userInDb) return res.status(404).send({ status: false, message: "User not found" })

        let cartInDb = await cartModel.findOne({ userId: userId })
        if (!cartInDb) return res.status(404).send({ status: false, message: "Cart not found" })

        let deleteCart = await cartModel.findOneAndUpdate({ _id: cartInDb._id }, { items: [], totalPrice: 0, totalItems: 0 })
        return res.status(200).send({ status: false, message: "Cart Delete Sucessfully" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, updateCart, getCart, deleteCart }