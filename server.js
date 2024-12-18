if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const methodOverride = require('method-override')
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter= require('./routes/books')
const mongoose = require('mongoose')

const app = express()
const db = mongoose.connection

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
db.on('error', error => console.error('Error'))
db.once('open', () => console.log('Connected to Mongoose'))

app.set("view engine", "ejs")
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(express.urlencoded({limit: '50mb', extended: true }))
app.use(express.json())
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use('/',indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT} on ${process.env.NODE_ENV}`)
);
