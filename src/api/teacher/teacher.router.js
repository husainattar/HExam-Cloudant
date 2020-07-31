'use strict';
const teacherRouter = require('express').Router()
    , path = require('path')
    , teacherController = require('./teacher.controller');

const {spawn} = require('child_process');
teacherRouter
    .post('/webPlagiarismReport',async(req,res) =>{

        var dataToSend;
        console.log(req.body.query);
        const python = spawn('python3', ['./web_plagiarism_check.py',req.body.query]);
        // collect data from script
        var report;
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            report = data.toString();
        });

        // in close event we are sure that stream from child process is closed
        python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log(report);
        res.send(report)
        });

    })
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