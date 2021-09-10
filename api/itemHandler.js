const { Router } = require('express')
const Item = require('../models/items')
const User = require('../models/user')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const router = Router()
dotenv.config()

// to get all items in store
// router.get('/',async (req,res) => {
//     const items = await Item.find()
//     if(items){
//         res.json(items)
//     }
// })


// create new item by admin
router.post('/',async (req,res, next) => {
    const {name, Category, address, UserID} = req.body;
    if(UserID == undefined){
        res.json({"msg": "User not found"});
    }
    
    const user = await User.findById({_id: UserID})

    if(user.role !== "Admin"){
        res.json({"msg": "Only Admin ca add Items"});
        return
    }

    const newItem = new Item({name, Category, address})
    const response = await newItem.save()
    res.json(response)
})


//updating item
router.patch('/update', async (req,res) => {
    const {itemID, updatedData, UserID} = req.body

 
    if(UserID == undefined){
        res.json({"msg": "User not found"});
    }
    const user = await User.findById({_id: UserID})

    if(user.role !== "Admin")
    res.json({"msg": "Only Admin can uodate Item"});

   
    const response = await Item.findByIdAndUpdate({_id: itemID}, updatedData,{new: true, runValidators: true})
    if(!response) {
        res.json({"msg": "item not found"})
    }

    res.json(response)
})


// for deleting items
router.delete('/delete',async (req,res) => {
    const {itemID, UserID} = req.body;
    
    if(UserID == undefined){
        res.json({"msg": "User not found"});
    }
    const user = await User.findById({_id: UserID})

    if(user.role !== "Admin")
    res.json({"msg": "Only Admin can update Item"});

    const item = await Item.findById({_id: itemID})
    if(!item){
        res.json({"msg": "item not found"})
    }
    
    const response = await Item.findByIdAndDelete({_id: itemID})
    if(!response){
        res.json({"msg": "item was not deleted"})
    }
    res.json(response)
})


module.exports = router