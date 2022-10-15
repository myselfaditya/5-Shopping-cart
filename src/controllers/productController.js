const productModel = require("../model/productModel")
const { uploadFile } = require("./aws")
const mongoose = require("mongoose")

const { isValidRequestBody, isValid, isValidName, validSizes, isValidPrice, isValidNumber } = require("../validator/validation")

const createProduct = async function (req, res) {
    try {

        let data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "body cant't be empty Please enter some data." })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, deletedAt, isDeleted } = data

        if (!title) return res.status(400).send({ status: false, message: "Title is required" })
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Provie the valid title" })
        let titleIn = await productModel.findOne({ title: title })
        if (titleIn) return res.status(400).send({ status: false, message: " Title is already used" })

        if (!description) return res.status(400).send({ status: false, message: "Description is required" })
        if (!isValid(description)) return res.status(400).send({ status: false, message: "Provie the valid description" })

        if (!price) return res.status(400).send({ status: false, message: "price is required" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Provied the valid price" })

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "Provied the Valid curruencyId" })
        if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: " currencyId should be in 'INR' Format" });

        if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyformat is required" })
        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "Currency format of product should not be empty" });
        if (currencyFormat) {
            if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format of product should be in '₹' " });
        } else {
            data.currencyFormat = "₹"
        }

        let files = req.files
        if (files.length == 0) return res.status(400).send({ status: false, msg: "productImage is mandatory" })
        let ImageLink = await uploadFile(files[0])
        productImage = ImageLink

        if (!isValid(style)) return res.status(400).send({ status: false, message: "Provie a valid style" })

        if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "provie the valid give availableSizes only" })
        if (!validSizes(availableSizes)) return res.status(400).send({ status: false, message: "provied valid sizes" })

        if (!isValidNumber(installments)) return res.status(400).send({ status: false, message: "Provied the valid installments and it will be in number format only" })

        if (deletedAt) {
            if (deletedAt !== null) return res.status(406).send({ status: false, message: "DeletedAt must be null" })
        }

        if (isDeleted) {
            if (isDeleted !== false) return res.status(406).send({ status: false, message: "IsDeleted must be false, while creating document" })
        }

        const productData = { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, deletedAt, isDeleted }
        let product = await productModel.create(productData)
        res.status(201).send({ status: true, message: "product created successfully", data: product })

    }
    catch (err) {
        res.status(500).send({ status: true, message: err.message })
    }

}


const getProduct = async function (req, res) {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const getProductById = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

        let products = await productModel.findOne({ _id: productId, isDeleted: false }).select({ __v: 0, deletedAt: 0 })

        if (!products) return res.status(404).send({ status: false, message: "products are not found" })

        res.status(200).send({ status: true, message: "success", data: products })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const updateProduct = async function (req, res) {
    try {

        let productId = req.params.productId
        let data = req.body

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

        let productsDb = await productModel.findOne({ _id: productId })

        if (!productsDb) return res.status(404).send({ status: false, message: "products are not found" })

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "body cant't be empty Please enter some data." })

        const filter = { isDeleted: false }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data


        if (filter.hasOwnProperty(title)) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title not be empty" });
            if (!isValidName.test(title)) return res.status(400).send({ status: false, message: "title only on string" })
            let uniquetitle = await productModel.findOne({ title: title })
            if (uniquetitle) return res.status(400).send({ status: false, message: "title Already Exists" })
            filter.title = uniquetitle
        }

        if (filter.hasOwnProperty(description)) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: " description not be empty" });
            if (!isValidName.test(description)) return res.status(400).send({ status: false, message: " description only on string" })
            filter.description = description
        }

        if (filter.hasOwnProperty(price)) {
            if (!isValid(price)) return res.status(400).send({ status: false, message: "price not be empty" });
            if (!isValidPrice.test(price)) return res.status(400).send({ status: false, message: "price only on string" })
            filter.price = price
        }

        if (filter.hasOwnProperty(currencyId)) {
            if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" })
            if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "Provied the Valid curruencyId" })
            if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: " currencyId should be in 'INR' Format" });
            filter.currencyId = currencyId
        }

        if (filter.hasOwnProperty(style)) {
            if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyformat is required" })
            if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "Currency format of product should not be empty" });
            if (currencyFormat) {
                if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format of product should be in '₹' " });
            } else {
                data.currencyFormat = "₹"
            }
            filter.currencyFormat = currencyFormat
        }

        if (filter.hasOwnProperty(productImage)) {
            let files = req.files
            if (!isValid(files)) return res.status.send({ status: false, message: "provie files should not be empty" })
            let ImageLink = await uploadFile(files[0])
            filter.productImage = ImageLink
        }

        // if (filter.hasOwnProperty(isFreeShipping)) {
        //     if (isFreeShipping !== false) return res.status(406).send({ status: false, message: "isFreeShipping must be true & false only" })
        //     filter.isFreeShipping = isFreeShipping
        // }

        if (filter.hasOwnProperty(style)) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "Provie a valid style" })
            filter.style = style
        }

        if (filter.hasOwnProperty(availableSizes)) {
            if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "provie the valid give availableSizes only" })
            if (!validSizes(availableSizes)) return res.status(400).send({ status: false, message: "provied valid sizes" })
            filter.availableSizes = availableSizes
        }

        if (filter.hasOwnProperty(installments)) {
            if (!isValidNumber(installments)) return res.status(400).send({ status: false, message: "Provied the valid installments and it will be in number format only" })
            filter.installments = installments
        }



        const productIs = await productModel.findOneAndUpdate({ _id: productId }, { $set: filter }, { new: true })

        if (!productIs) return res.status(404).send({ status: false, message: "productIs not found" })

        res.status(200).send({ Status: true, message: "product updated Successfully", Data: productIs })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const deleteProduct = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

        let productInDb = await productModel.findOne({ _id: productId })

        if (!productInDb) return res.status(404).send({ status: false, message: "Data not found" })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) return res.status(404).send({ status: false, message: "Product is already deleted" })

        let deleteProduct = await productModel.findByIdAndUpdate({ _id: productId },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: Date()
                }
            })

        res.status(200).send({ status: true, message: "Deleted product successfully" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}





module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteProduct }