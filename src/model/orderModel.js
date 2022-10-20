const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userId: { type: objectId, ref: "User", required: true, trim: true },
    items: [{
        productId: { type: objectId, ref: "PRODUCT", required: true, trim: true },
        quantity: { type: Number, required: true, trim: true, min: 1 },
        _id : 0
    }],
    totalPrice: { type: Number, required: true, trim: true },
    totalItems: { type: Number, required: true, trim: true },
    totalQuantity: { type: Number, required: true, trim: true },
    cancellable: { type: Boolean, default: true },
    status: { type: String, default: 'pending', enum: ["pending", "completed", "canceled"] },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true })

module.exports = mongoose.model("ORDER", orderSchema)