'use strict';
// const connection = require('../../config/db'),
 const db=require('../../config/cloudantdb.js')
    , uuid = require('uuid')
    , async = require('async');

module.exports = {
    create: async ({ title, description, duration, start, end, date, students, test_content }) => {
        return new Promise(async (resolve, reject) => {
            const testId = uuid.v4();
            // connection.beginTransaction((err) => {
            //     if (err) {
            //         connection.rollback()
            //         reject(err)
            //     }
            //     connection.execute('INSERT INTO tests (id, title, description, duration, start, end, date) values(?,?,?,?,?,?,?)', [testId, title, description, duration, start, end, date], (err, results) => {
            //         if (err) {
            //             connection.rollback()
            //             reject(err)
            //         }
            //         students.forEach(studentEmail => {
            //             connection.query('INSERT INTO reports(student_email, test_id) values(?,?)', [studentEmail, testId], (err, results) => {
            //                 if (err) {
            //                     connection.rollback()
            //                     reject(err)
            //                 }
            //             })
            //         })
            //         connection.commit((err) => {
            //             if (err) {
            //                 connection.rollback()
            //                 reject(err)
            //             }
            //             resolve("Inserted")
            //         })
            //     })
            // })

            let list={
                _id:testId, type:"test",title:title, description:description, 
                duration:duration, 
                start:start, end:end, date:date, test_content: test_content
            }


            db.insert(list, (err, result) => {
                if (err) {
                    logger.error('Error occurred: ' + err.message, 'create()');
                    reject(err);
                } else {
                    let documents=result
                    students.forEach(studentEmail => {
                                    // connection.query('INSERT INTO reports(student_email, test_id) values(?,?)', [studentEmail, testId], (err, results) => {
                                    //     if (err) {
                                    //         connection.rollback()
                                    //         reject(err)
                                    //     }
                                    // })
                        let newlist={
                        _id:uuid.v4(), 
                        test_id:testId,
                        type:"report",student_email:studentEmail
                    }
                    db.insert(newlist, (err, result) => {
                        if (err) {
                            logger.error('Error occurred: ' + err.message, 'create()');
                            db.destroy(documents.id,documents.rev,function(err){
                                if (!err) {
                                    console.log("Successfully deleted doc with fkId: "+ documents.id);
                                    // res.json({success: true, msg: 'Successfully deleted the item from the database.'});
                                  } else {
                                    reject(err);
                                //    resolve({success: false, msg: 'Failed to delete with fkId from the database, please try again.'});
                                  }
                            })
                            reject(err);
                        } else {
                            resolve("Inserted-Successfully");
                        }
                    });
                 })
                    // resolve({ data: { email: email, name: name, path: imgpath,createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                }
            });





        })
    },
    get: async ({ id }) => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT * FROM tests WHERE id = ?', [id], (err, rows, fields) => {
            //     if (err)
            //         reject(err)
            //     else
            //         resolve(rows[0])
            // })
            db.find({
                'selector': {
                    'type': "test",
                    '_id': id
                }
            }, (err, documents) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ data: documents.docs, statusCode: (documents.docs.length > 0) ? 200 : 404 });
                }
            });
        })
    },
    getAll: async () => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT * FROM tests', (err, rows, fields) => {
            //     if (err)
            //         reject(err)
            //     else
            //         resolve(rows)
            // })
            db.find({
                'selector': {
                    'type': "test"
                }
            }, (err, documents) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ data: documents.docs, statusCode: (documents.docs.length > 0) ? 200 : 404 });
                }
            });
        })
    },
    getStudentsEmail: async ({ id }) => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT student_email FROM reports WHERE test_id = ?', [id], (err, rows, fields) => {
            //     if (err)
            //         reject(err)
            //     else
            //         resolve(rows)
            // })
            db.find({
                'selector': {
                    'type': "report",
                    'test_id':id
                }
            }, (err, documents) => {
                if (err) {
                    reject(err);
                } else {
                    const data=documents.docs.map(data=>data.student_email);
                    console.log(data)
                    resolve({ data: data, statusCode: (data.length > 0) ? 200 : 404 });
                }
            });
        })
    }
}
