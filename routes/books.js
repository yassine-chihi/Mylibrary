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
    saveCover(res, book, req.body.cover)
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (error){
        console.log(error);
        renderNewPage(res, book, true)
    }
})

// Show Book Route
router.get('/:id', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec() // add author properties such as name since book schema has only the id of the author
        res.render('books/show', { book: book })
    } catch (error) {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (error) {
        console.error(error)
        res.redirect('/')
    }
})

// Update Book page
router.put('/:id', async(req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        if (book != null) {
            renderEditPage(res, book, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete Book page
router.delete('/:id', async (req,res) => {
    let book
    try {
        const book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove the book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError= false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find() 
        const params = {
            authors: authors,
            book: book
        }
        if (hasError){
           if (form === 'edit') {
                params.errorMessage = 'Error while Updating Book'
           }  else {
                params.errorMessage = 'Error while Creating Book'
           }
        }
        res.render(`books/${form}`, params)
    } catch  {
        res.redirect('books')
    }
}

function saveCover(res, book, coverImageEncoded) {
    if (coverImageEncoded == null) return
    try {
        const cover = JSON.parse(coverImageEncoded)
        if (cover != null && imageMimeTypes.includes(cover.type)) {
            book.coverImage = new Buffer.from(cover.data, 'base64')
            book.coverImageType = cover.type
        }
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router

// **** Used filepond plugins instead of this static method to upload images ****

// const uploadPath = path.join('public', Book.coverImageBasePath)
// const fs = require('fs')
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