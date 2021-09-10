const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// all api
const userRouter = require('./api/userHandler')
const itemRouter = require('./api/itemHandler')
const orderRouter = require('./api/orderHandler')

const bodyParser = require('body-parser')
const { json, urlencoded } = require('express')
const app = express()
dotenv.config()

const PORT = process.env.PORT || 5000;


const connection = mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
connection.then(() => {
    console.log("Database Connected succesfully")
})

app.use(morgan('tiny'))
app.use(helmet())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(bodyParser({urlencoded: true}))
app.use(bodyParser.json())

app.use('/user/',userRouter)
app.use('/item/',itemRouter)
app.use('/order/',orderRouter)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})