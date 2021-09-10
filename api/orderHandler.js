const { Router } = require('express')
const User = require('../models/user')
const Item = require('../models/items')
const Order = require('../models/order')
const dotenv = require('dotenv')


const router = Router()
dotenv.config()

//get all orders by admin, delivery person, and User
router.post('/', async (req, res) => {
    const { UserID, Filtertype } = req.body;

    const user = await User.findById({ _id: UserID })

    if (!user) {
        res.json({ "msg": "User doesn't exist" })
        return
    }

    if (user.role == 'Admin') {
        if (!Filtertype || Filtertype == "") {
            const orders = await Order.find()
            orders ? res.json(orders) : res.json({ "msg": "No Orders Yet" });
        } else {
            const orders = await Order.find({ status: Filtertype })
            orders ? res.json(orders) : res.json({ "msg": "No Orders Yet" });
        }
    }
    else if (user.role == 'Customr' || user.role == 'deliveryPerson') {
        if (!Filtertype) {
            const orders = await Order.findById({ _id: UserID })
            orders ? res.json(orders) : res.json({ "msg": "No Orders Yet" });
        }
    }

})

//making order from user 
router.post('/create', async (req, res) => {
    const { ItemID, Quantity, UserID } = req.body;

    const user = await User.findById({ _id: UserID });

    if (!user) res.json({ "msg": "User doesn't exist" });
    if (user.role !== 'Customer') {
        res.json({ "msg": "Register as a cutomer to make orders" });
        return
    }

    const item = await Item.findById({ _id: ItemID })
    if (!item) {
        res.json({ msg: "Item not found in store" })
    }
    const addressList = item.address;
    const address = addressList[Math.floor(Math.random() * addressList.length)];


    const newOrder = new Order({ ItemID, UserID, Quantity, status: "OrderCreated", pickupLocation: address })
    const response = await newOrder.save()
    if (response) {
        res.json(response);
    }
})

// assigning delevery person to an order (by admin) 
router.patch('/addDeliveryPerson', async (req, res) => {
    const { AdminID, OrderID, DeliveryPersonID } = req.body;

    const Admin = await User.findById({ _id: AdminID })

    if (!Admin || Admin.role !== "Admin") {
        res.json({ msg: "Access Denied" })
    }

    const deliveryPersons = await User.findById({ _id: DeliveryPersonID });

    if (!deliveryPersons || deliveryPersons.role !== "DeliveryPerson") {
        res.json({ msg: "Assign delivery person to the orders" })
        return
    }

    const order = await Order.findByIdAndUpdate({ _id: OrderID }, { deliveryPerson: DeliveryPersonID }, { new: true })
    if (!order) {
        res.json({ msg: "Order update failed" })
        return
    }
    res.json(order)
})

// to update order status (by delivery person)
router.patch('/updatestatus',async (req,res) => {
    const {OrderID, DeliveryPersonID, status} = req.body;
    try {
        const order = await Order.findOne({_id: OrderID})
        if(!order){
            res.json({msg: "No Order Found"})
            return
        }

        if(order.deliveryPerson != DeliveryPersonID){
            res.json({msg: "Permission Dennied"})
            return
        }
        
        const statusOptions= ['OrderCreated', "ReachedStore", "ItemPicked", "EnRoute", "Delivered", "Canceled"]
        

        const isValidUpdate = statusOptions.includes(status);
        if(!isValidUpdate){
            res.json({msg: "Invalid Status Option"})
            return
        }
        
        const prevOrder = await Order.findByIdAndUpdate({_id: OrderID},{status: status},{new: false})
        if(!prevOrder) {
            res.json({msg: "Order not updated"})
        }
        const updatedOrder = await Order.findOne({_id: OrderID, deliveryPerson: DeliveryPersonID})
        
        updatedOrder && res.json(updatedOrder)

    } catch (error) {
        res.json({msg: "Order not updated"})
    }
   
 }) 


module.exports = router