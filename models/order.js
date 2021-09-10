const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
    ItemID: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    UserID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    Quantity: {
        type: Schema.Types.Number,
        required: true,
    },
    status:{
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    deliveryPerson: {
        type: Schema.Types.ObjectId,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)
