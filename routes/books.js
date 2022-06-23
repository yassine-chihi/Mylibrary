const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpg','image/png', 'image/jpeg', 'image/gif']
const uploadPath = path.join('public', Book.coverImageBasePath)
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get('/', async(req, res) => {
    try {
        let query = Book.find()
        if (req.query.title != null && req.query.title != '') {
            query = query.regex('title', new RegExp(req.query.title, 'i'))
        }
        if (req.query.publishBefore != null && req.query.publishBefore != ''){
            query = query.lte('publishDate', req.query.publishBefore)
        }
        if (req.query.publishAfter != null && req.query.publishAfter != ''){
            query = query.gte('publishDate', req.query.publishAfter)
        }
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async(req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: fileName
    })
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch {
        if (book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({}) 
        const params = {
            authors: authors,
            book: book
       }
        if (hasError===true) params.errorMessage = 'Error while creating Book'
        res.render('books/new', params)
     } catch  {
        console.log('catch is here !')
        res.redirect('books')
    }
}
    
module.exports = router