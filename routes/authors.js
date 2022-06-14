const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All Athors Route
router.get('/', async(req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query,
        })
    } catch {
        res.redirect('/')
    }
})

// New Auhors Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author() })
})

// Create Author Route
router.post('/', async(req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        //res.redirect(`authors/${newAuthor.id}`)
        res.redirect('authors')
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
})

module.exports = router

// author.save((err, newAuthor) => {
//     if (err) {
//         res.render('authors/new', {
//             author: author,
//             errorMessage: 'Error creating author'
//         })
//     } else {
//         //res.redirect(`authors/${newAuthor.id}`)
//         res.redirect('authors')
//     }
// })