'use strict';
const testRouter = require('express').Router()
    , path = require('path')
    , testController = require('./test.controller');

testRouter
    .get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../../../public/html/create_test.html'))
    })
    .get('/all', async (req, res) => {
        try {
            const result = await testController.getAll()
            res.json(result)
        } catch (error) {
            res.status(404).send(error)
        }   
    })
    .post('/', async (req, res) => {
        try {
            console.log(req.body.students)
            if(!Array.isArray(req.body.students))
                req.body.students=[req.body.students]                

            const result = await testController.create({ title: req.body.title, description: req.body.description, duration: req.body.duration, start: req.body.start, end: req.body.end, date: req.body.date, students: req.body.students, test_content : req.body.test_content })
            res.redirect('/api/teacher/home')
        } catch (error) {
            res.sendStatus(404)
        }
    })
    .get('/:id', async (req, res) => {
        try {
            const result = await testController.get({ id: req.params.id })
            res.json(result)
        } catch (error) {
            res.sendStatus(404)
        }
    })
    .get('/students/:id', async (req, res) => {
        try {
            console.log(req.params.id)
            const result = await testController.getStudentsEmail({ id: req.params.id })
            console.log("From-database");
            console.log(result);
            res.json(result)
        } catch (error) {
            res.sendStatus(404)
        }
    })

module.exports = testRouter
