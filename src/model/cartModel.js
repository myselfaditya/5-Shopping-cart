const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId
const cartSchema = new mongoose.Schema({

    userId: { type: objectId, ref: "User", required: true, unique: true, trim: true },
    items: [{
        productId: { type: objectId, ref: "PRODUCT", required: true, trim: true },
        quantity: { type: Number, required: true, min:1, trim: true, min: 1},
        _id : 0
    }],
    totalPrice: { type: Number, required: true, trim: true },
    totalItems: { type: Number, required: true, trim: true }

}, { timestamps: true })

module.exports = mongoose.model("CART", cartSchema)