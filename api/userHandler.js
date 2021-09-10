const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')


const router = Router()
dotenv.config()
router.get('/',async (req,res) => {
    const users = await User.find();
    if(users){
        res.json(users)
    }
})

router.delete('/delete', async (req,res) => {
    const { UserID } = req.body;
    const deletedUser = await User.findByIdAndDelete({_id: UserID})
    if(!deletedUser){
        return
    }
    res.json(deletedUser)
})


// registering new user
router.post('/register', async (req, res, next) => {
    const {name, mobileNo, password, passwordCheck, role } = req.body;
    try {
        if (!password || !passwordCheck || !mobileNo || !name)
            return res.status(400).json({ msg: 'Enter all fields value' })

        if (password.length < 5) {
            return res.status(400).json({ msg: 'Password is too small' })
        }
        if (password != passwordCheck)
            return res.status(400).json({ msg: 'Password don\'t match' })

        if(!Number.isInteger(mobileNo)){
                return res.status(400).json({ msg: 'Pleas provide mobile number' })
        }
        const existingUser = await User.findOne({ mobileNo })
        if (existingUser)
            return res.status(400).json({ msg: 'This mobile is already register' })

        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)
        const newUser = new User({name, mobileNo, password: passwordHash, role: role })
        const response = await newUser.save()
        res.json({ name: response.name, mobileNo: response.mobileNo, _id: response._id })
    } catch (error) {
        if (error.name === 'ValidationError')
            return res.status(422)
        next(error)
    }
})


// for signin user (return accesstoken)
router.post('/login', async (req, res, next) => {
    const {  mobileNo, password } = req.body;
    try {
        if (!mobileNo || !password)
            return res.status(400).json({ msg: 'Enter all fields value' })

        const user = await User.findOne({ mobileNo })
        if (!user)
            return res.status(400).json({ msg: 'User doesn\'t exist' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(400).json({ msg: 'Invalid Credentials' })

      
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({
            token,
            user: {
                id: user._id,
                mobileNo: user.mobileNo,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
})

//to validate the token
router.post('/tokenIsValid', async (req, res, next) => {
    try {
        const token = req.header('x-auth-token')
        if (!token) return res.json(false)

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (!verified) return res.json(false)

        const user = await User.findById(verified.id)
        if (!user) return res.json(false)

        return res.json(true)
    } catch (error) {
        next(error)
    }
})



module.exports = router