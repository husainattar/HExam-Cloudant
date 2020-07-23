'use strict';
const teacherRouter = require('express').Router()
    , path = require('path')
    , teacherController = require('./teacher.controller');

teacherRouter
    .post('/login', async (req, res) => {
        try {
            const result = await teacherController.ifExists({
                email: req.body.email,
                pass: req.body.pass
            })
            res.redirect('/api/teacher/home')
        } catch (error) {
            res.sendStatus(404)
        }
    })
    .get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, '../../../public/html/home.html'))
    })


module.exports = teacherRouter