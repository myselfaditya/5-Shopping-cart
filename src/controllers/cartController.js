const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const mongoose = require('mongoose')

const { isValidRequestBody, isValidNumber } = require("../validator/validation")

const createCart = async function (req, res) {
    try {
        let requestparams = req.params.userId
        let requestBody = req.body
        const { productId, cartId } = requestBody
        //===================== if body is empty ===========================================
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "body cant't be empty Please enter some data" })
        }
        //============================= only valid keys can be entered in body ===================
        if (!(cartId || productId)) {
            return res.status(400).send({ status: false, message: "Please valid keys to create cart like: cartId, productId" })
        }
        //========================== if cartId is present =====================================
        if (cartId) {
            if (!mongoose.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "invalid cartId format" })
            }
            let cartExist = await cartModel.findById(cartId)
            if (!cartExist) {
                return res.status(404).send({ status: false, message: "cart does not exist" })
            }
        }
        //============================== if product id is present ==========================================
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "invalid productId format" })
        }
        let productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExist) {
            return res.status(404).send({ status: false, message: "product does not exist" })
        }

        //========================== check if cart belong to the same user ==================================
        let validCart = await cartModel.findOne({ userId: requestparams })
        if (validCart) {
            if (cartId) {
                if (validCart._id.toString() != cartId) {
                    return res.status(403).send({ status: false, message: `Cart does not belong to this user` })
                }
            }

            let productInCart = validCart.items
            let proId = productExist._id.toString()
            for (let i = 0; i < productInCart.length; i++) {
                let productFromItem = productInCart[i].productId.toString()

                //==================== if product is already present in cart ==========================================
                if (proId == productFromItem) {
                    let oldCount = productInCart[i].quantity
                    let newCount = oldCount + 1
                    let uptotal = (validCart.totalPrice + (productExist.price)).toFixed(2)
                    productInCart[i].quantity = newCount
                    validCart.totalPrice = uptotal
                    await validCart.save();
                    // await validCart.populate({ path: "items.productId", select: { price: 1, title: 1, productImage: 1, _id: 0 } })
                    return res.status(201).send({ status: true, message: 'Success', data: validCart })
                }
            }
            //================================== if new product wants to be added ====================================
            validCart.items.push({ productId: productId, quantity: 1 })
            let total = (validCart.totalPrice + (productExist.price * 1)).toFixed(2)
            validCart.totalPrice = total
            let count = validCart.totalItems
            validCart.totalItems = count + 1
            await validCart.save()
            // await validCart.populate({ path: "items.productId", select: { price: 1, title: 1, productImage: 1, _id: 0 } })
            return res.status(201).send({ status: true, message: 'Success', data: validCart })
        }
        //==================================== if user does not have cart ==============================================
        let calprice = (productExist.price * 1).toFixed(2)
        let obj = {
            userId: requestparams,
            items: [{ productId: productId, quantity: 1 }],
            totalPrice: calprice,
        }
        obj['totalItems'] = obj.items.length
        let result = await cartModel.create(obj)
        // await result.populate({ path: "items.productId", select: { price: 1, title: 1, productImage: 1, _id: 0 } })
        return res.status(201).send({ status: true, message: 'Success', data: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let body = req.body
        let { cartId, productId, removeProduct } = body

        //========================================== if body is missing ==============================
        if (!isValidRequestBody(body))
            return res.status(400).send({ status: false, message: "body cant't be empty Please enter some data" });

        //=========================== only 2 keys should be entered in body ============================
        if (!(cartId || removeProduct || productId)) {
            return res.status(400).send({ status: false, message: "Provie valid keys to update a cart like: cartId, productId removeProduct" })
        }

        //====================================== cart exist or not ==================================
        let cartExist = await cartModel.findOne({ userId: userId })
        if (!cartExist) {
            return res.status(404).send({ status: false, message: "Cart not found" });
        }

        //======================================== cartId Validation ==================================
        if (cartId) {
            if (!mongoose.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "provide valid cartId" });
            }
            if (cartExist._id.toString() != body.cartId) {
                return res.status(400).send({ status: false, message: `this cart belong to different user` });
            }
        }
        //==================================== if product  id is present =============================
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "provide valid productId" });
        }
        let findProduct = await productModel.findById(body.productId)
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }

        let productArr = cartExist.items.filter(x =>
            x.productId.toString() == body.productId) // will return an array 

        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "product is not present in the cart" })
        }
        let indexNumber = cartExist.items.indexOf(productArr[0]) // return index no of productArr

        //============================ if removeProduct is present ===================================
            if (isValidNumber(removeProduct)) {
                if (!(removeProduct == 0 || removeProduct == 1)) {
                    return res.status(400).send({ status: false, message: "removeProduct can either be 0 or 1" })
                }
                if (removeProduct == 0) {
                    cartExist.totalPrice = (cartExist.totalPrice - (findProduct.price * cartExist.items[indexNumber].quantity)).toFixed(2) //to fixed is used to fix the decimal value to absolute value/or rounded value
                    cartExist.items.splice(indexNumber, 1)
                    cartExist.totalItems = cartExist.items.length
                    await cartExist.save()
                    await cartExist.populate({ path: "items.productId", select: { price: 1, title: 1, productImage: 1, _id: 0 } })
                }
                if (removeProduct == 1) {
                    cartExist.items[indexNumber].quantity -= 1;
                    cartExist.totalPrice = (cartExist.totalPrice - findProduct.price).toFixed(2)
                    if (cartExist.items[indexNumber].quantity == 0) {
                        cartExist.items.splice(indexNumber, 1)
                    }
                    cartExist.totalItems = cartExist.items.length
                    await cartExist.save()
                    await cartExist.populate({ path: "items.productId", select: { price: 1, title: 1, productImage: 1, _id: 0 } })
                }
        }
        return res.status(200).send({ status: true, message: "Success", data: cartExist })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
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
        return res.status(204).send({ status: false, message: "Cart Delete Sucessfully" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, updateCart, getCart, deleteCart }