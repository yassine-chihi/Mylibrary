const express = require('express')
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpg','image/png', 'image/jpeg', 'image/gif']
const router = express.Router()

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
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch {
        renderNewPage(res, book, true)
        console.error(book.save());
    }
})

async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find() 
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

function saveCover(book, coverImageEncoded) {
    if (coverImageEncoded == null) return
    const cover = JSON.parse(coverImageEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router


// **** Used filepond plugins instead of this static method to upload images ****
// const uploadPath = path.join('public', Book.coverImageBasePath)
// const upload = multer({
    //     dest: uploadPath,
    //     fileFilter: (req, file, callback) => {
        //         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

// function removeBookCover(fileName) {
    //     fs.unlink(path.join(uploadPath, fileName), err => {
        //         if (err) console.error(err)
        //     })
        // }