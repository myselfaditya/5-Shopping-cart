const productModel = require("../model/productModel")
const { uploadFile } = require("./aws")
const mongoose = require("mongoose")

const { isValidRequestBody, isValid, isValidName, validSizes, isValidPrice, isValidNumber, isValidDigit, isValidfild } = require("../validator/validation")

const createProduct = async function (req, res) {
    try {

        let data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "body cant't be empty Please enter some data." })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, deletedAt, isDeleted } = data

        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required" })
        let titleIn = await productModel.findOne({ title: title })
        if (titleIn) return res.status(400).send({ status: false, message: " Title is already used" })

        if (!isValid(description)) return res.status(400).send({ status: false, message: "Description is required" })

        if (!price) return res.status(400).send({ status: false, message: "price is required" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Provied the valid price in Number/decimal" })

        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: " currencyId should be in 'INR' Format" });

        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyformat is required" });
        if (currencyFormat) {
            if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format of product should be in '₹' " });
        } else {
            data.currencyFormat = "₹"
        }

        let files = req.files
        if (files.length == 0) return res.status(400).send({ status: false, msg: "productImage is mandatory and It must be file" })
        let ImageLink = await uploadFile(files[0])
        productImage = ImageLink

        if(style) {if (!isValid(style)) return res.status(400).send({ status: false, message: "Provie a valid style" })}

        
        if(availableSizes) {if (!validSizes(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']" })}

        if(installments) {if (!isValidDigit(installments)) return res.status(400).send({ status: false, message: "Provied the valid installments and it will be in number format only" })}

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
        let queryData = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryData
        //===========================if no query then filter with isDeleted:false========================
        if (Object.keys(queryData).length == 0) {
            let filterData = await productModel.find({ isDeleted: false })
            return res.status(200).send({ status: true, message: `Found ${filterData.length} Items`, data: filterData })
        }
        let keys = "size, name, priceGreaterThan, priceLessThan, priceSort"

        //============================= if query is present ============================================
        if (!isValidfild(name)) return res.status(400).send({ status: false, message: "provide some value in given name query param" })
        if (!isValidfild(size)) return res.status(400).send({ status: false, message: "provide some value in given size query param" })
        if (!isValidfild(priceGreaterThan)) return res.status(400).send({ status: false, message: "provide some value in given priceGreaterThan query param" })
        if (!isValidfild(priceLessThan)) return res.status(400).send({ status: false, message: "provide some value in given priceLessThan query param" })
        if (!isValidfild(priceSort)) return res.status(400).send({ status: false, message: "provide some value in given priceSort query param" })

        if (size || priceSort || priceLessThan || priceGreaterThan || name) {

            let objectFilter = { isDeleted: false }
            //================================ if size query is present ==========================================
            if (size) {
                let checkSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let arraySize = size.split(",")
                for (let i = 0; i < arraySize.length; i++) {
                    if (checkSizes.includes(arraySize[i])) {
                        continue;
                    }
                    else {
                        return res.status(400).send({ status: false, message: "Sizes should in this ENUM only S/XS/M/X/L/XXL/XL" })
                    }
                }
                objectFilter["availableSizes"] = { $in: arraySize }
            }
            //==================================== if name query is present ======================================
            if (name) {
                if (!isValid(name)) return res.status(400).send({ status: false, message: "Name should not be empty" })
                name = name.replace(/\s+/g, ' ').trim()
                objectFilter["title"] = { $regex: name, $options: 'i' }
            }
            //=============================== if pricegreaterthen is present =========================
            if (priceGreaterThan) {
                if (!isValid(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan is empty" })
                if (!isValidNumber(priceGreaterThan)) return res.status(400).send({ status: false, message: "You entered invalid priceGreaterThan.please enter number." })
                objectFilter["price"] = { $gt: priceGreaterThan }
            }
            //================================ if pricelessthen is present ====================================
            if (priceLessThan) {
                if (!isValid(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan is empty" })
                if (!isValidNumber(priceLessThan)) return res.status(400).send({ status: false, message: "You entered invalid priceLessThan" })
                objectFilter["price"] = { $lt: priceLessThan }

            }
            //================== if both pricegreaterthan and pricelessthan is present ===================
            if (priceGreaterThan && priceLessThan) {
                objectFilter['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }
            }
            //========================= if pricesort query is present ==================================
            if (priceSort) {
                if (isValid(priceSort)) {
                    if (!(priceSort == "1" || priceSort == "-1")) return res.status(400).send({ status: false, message: "You entered an invalid input sorted By can take only two Inputs 1 OR -1" })
                }
            }

            //========================== fetching data using filters =======================================
            let findFilter = await productModel.find(objectFilter).sort({ price: priceSort })
            if (findFilter.length == 0) return res.status(404).send({ status: false, message: "No product Found" })

            return res.status(200).send({ status: true, message: `${findFilter.length} Match Found`, data: findFilter })
        }
        else {
            return res.status(400).send({ status: false, message: `Cannot provide keys other than ${keys}` })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
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
        let body = req.body
        const files = req.files
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = body
        const data = {}

        //=============================== invalid format of productid ==============================
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not in valid format' })

        let product = await productModel.findById(productId)
        //========================== product not found ==========================================
        if (!product) return res.status(404).send({ status: false, message: 'product not found' })
        //============================= if product is already deleted ============================
        if (product.isDeleted == true) return res.status(400).send({ status: false, message: `Product is deleted cant be upgrade` })

        //========================= if no keys are provided to update data========================
        if (!(title || description || price || currencyId || currencyFormat || isFreeShipping || style || availableSizes || installments )) {
            return res.status(400).send({ status: false, message: `please enter valid key in body` })
        }
     

        //==================================== if title is present ======================================
        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title can not be empty" })
            if (await productModel.findOne({ title: title })) return res.status(400).send({ status: false, message: `This title ${title} is already present please Give another Title` })
            data.title = title
        }

        //================================= if discription is present ==================================
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description can not be empty" })
            data.description = description
        }

        //================================= if price is present ========================================
        if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price should be in valid Format with Numbers || Decimals" })
            data.price = price
        }

        //==================================== if currencyid is present ==============================
        if (currencyId) {
            if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId can not be empty" })
            if (!/^INR$/.test(currencyId)) return res.status(400).send({ status: false, message: `currencyId Should be in this form 'INR' only` })

            data.currencyId = currencyId
        }

        //================================== if currencyformat is present ==========================
        if (currencyFormat) {
            if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat can not be empty" })
            if (!/^₹$/.test(currencyFormat)) return res.status(400).send({ status: false, message: `currencyFormat Should be in this form '₹' only` })

            data.currencyFormat = currencyFormat
        }

        //============================ if isfreeshipping is present ======================================
        if (isFreeShipping) {
            if (!isValid(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping can not be empty" })
            if (!/^(true|false)$/.test(isFreeShipping)) return res.status(400).send({ status: false, message: `isFreeShipping Should be in boolean with small letters` })
            data.isFreeShipping = isFreeShipping
        }

        //============================== if style is present =============================================
        if (style) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "style can not be empty" })
            data.style = style
        }

        //====================================== if avalaible sizes is present ==========================
        if (availableSizes) {
            if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes can not be empty" })
            availableSizes = availableSizes.toUpperCase()
            let size = availableSizes.split(',').map(x => x.trim())
            //============================= checking enum validation ===========================
            for (let i = 0; i < size.length; i++) {
                if (!validSizes(size[i]))
                    return res.status(400).send({ status: false, message: `availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']` })

            }
            data['$addToSet'] = {}
            data['$addToSet']['availableSizes'] = size

        }

        //=============================== if installments is present =======================================
        if (installments) {
            if (!/^\d+$/.test(installments)) return res.status(400).send({ status: false, message: "installments should have only Number" })

            data.installments = installments
        }

        //=================================== updating product ===========================================
        const newProduct = await productModel.findByIdAndUpdate(productId, data, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: newProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
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

        res.status(200).send({ status: true, message: "product Deleted successfully" })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteProduct }