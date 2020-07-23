'use strict';
const express = require('express')
    , apiRouter = express.Router()
    , studentRouter = require('./student/student.router')
    , teacherRouter = require('./teacher/teacher.router')
    , testRouter = require('./test/test.router')
    , path = require('path');

apiRouter.use('/student', studentRouter);
apiRouter.use('/teacher', teacherRouter);
apiRouter.use('/test', testRouter);

apiRouter.use('/test', express.static('public'))
apiRouter.use('/teacher', express.static('public'))
apiRouter.use('/student', express.static('public'))

apiRouter.use('*', (req, res) => {
    res.status(404) 
    res.send("Resource not found")
})

module.exports = apiRouter;