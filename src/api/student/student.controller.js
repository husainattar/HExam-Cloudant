"use strict"
// const connection = require('../../config/db');
const db=require('../../config/cloudantdb');
const { uuid } = require('uuidv4');

module.exports = {
    getAll: async () => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT * FROM students', (err, rows, fields) => {
            //     if (err)
            //         reject(err)
            //     else
            //         resolve(rows)
            // })
            db.find({
                'selector': {
                    'type': "student"
                }
            }, (err, documents) => {
                if (err) {
                    reject(err);
                } else if(documents.docs.length === 0){
                    console.log(documents);
                    reject("no account found");
                }else {
                    // console.log(JSON.stringify(documents.docs));
                    resolve(documents.docs);
                }
            });

        })
    },
    getReport: async ({ email,test_id }) => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT * FROM reports WHERE student_email = ? AND test_id= ?', [email,test_id], (err, rows, fields) => {
            //     console.log("rows 0:",rows[0])
            //     if (err)
            //         reject(err)
            //     else if (rows[0] == null)
            //         reject(err)
            //     else
            //         resolve(rows[0])
            // })
            console.log("In-Here");
            db.find({
                'selector': {
                    'type': "report",
                    'student_email':email,
                    'test_id':test_id
                }
            }, (err, documents) => {
                if (err) {
                    console.log("Error");
                    reject(err);
                } else if(documents.docs.length === 0){
                    console.log("No-Lenght");
                    reject(err);
                }
                else {
                    console.log(documents);
                    resolve({ data: documents.docs, statusCode: (documents.docs.length > 0) ? 200 : 404 });
                }
            });
        })
    },
    updateReport: async ({ faceSuspicion, eyeSuspicion, tabSwitches, email, testId }) => {
        return new Promise((resolve, reject) => {
            console.log("updating",faceSuspicion,eyeSuspicion)
            // connection.execute('UPDATE reports SET face_suspicion = ?, eye_suspicion = ?, tab_switches = ? WHERE student_email = ? AND test_id = ?', [faceSuspicion, eyeSuspicion, tabSwitches, email, testId], (err, result) => {
            //     if (err)
            //         reject(err)
            //     else
            //         resolve({ msg: "UPDATED" })
            // })
            db.find({
                'selector': {
                    'type':"report",
                    'test_id':testId,
                    'student_email':email
                      }
                        }, (err, documents) => {
                            if (err) {
                                reject(err);
                            } else if(documents.docs.length === 0){
                                reject(err);
                            }
                            else {

                                // resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
                                let list=documents.docs[0];

                                list.face_suspicion=faceSuspicion;
                                list.eye_suspicion=eyeSuspicion;
                                list.tab_switches=tabSwitches;

                                db.insert(list, (err, result) => {
                                    if (err) {
                                        logger.error('Error occurred: ' + err.message, 'create()');
                                        reject(err);
                                    } else {
                                        resolve({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                                        console.log(result);
                                    }
                                });
                              
                            }
                 });


        })
    },
    insert: async ({ name, email, filename }) => {

        return new Promise((resolve, reject) => {

            // const url="https://hexam.eu-gb.mybluemix.net/";
            const url="http://localhost:3000/"
            // connection.execute('INSERT INTO students VALUES(?,?,?)', [email, name, url+"uploads/"+filename ], (err, result) => {
            //     if (err){
            //         console.log(err);
    
            //             reject(err)

            //     }
            //     else
            //         resolve({ email: email, name: name, path: url+"uploads/" + filename})
            // })
            let listId = uuid();
            let imgpath = url +"uploads/"+ filename;
            let list = {
                _id: listId,
                id: listId,
                type: 'student',
                email: email,
                name: name,
                path: imgpath
            };
            db.insert(list, (err, result) => {
                if (err) {
                    logger.error('Error occurred: ' + err.message, 'create()');
                    reject(err);
                } else {
                    resolve({ data: { email: email, name: name, path: imgpath,createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                }
            });
        })
    },
    fetch : async ({ email }) => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT * FROM students WHERE email = ?', [email], (err, rows, fields) => {
            //     if (err)
            //         reject(err)
            //     else if (rows[0] == null)
            //         reject(err)
            //     else
            //         resolve(rows[0])
            // })
            db.find({
                'selector': {
                    'type': "student",
                    'email':email
                }
            }, (err, documents) => {
                if (err) {
                    reject(err);
                } 
                else if(documents.docs.length === 0)
                {
                    console.log(documents);
                    reject("no account found");
                   
                }else{
                    console.log(documents);
                    resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
                }
            });

        })
    }
}



////Used-to-create-Put-request

// let updateReport = (faceSuspicion, eyeSuspicion, tabSwitches, email, testId)=>{
//     return new Promise((resolve, reject) => {
//         db.find({
//             'selector': {
//                 'type':"report",
//                 'test_id':testId,
//                 'student_email':email
//                   }
//                     }, (err, documents) => {
//                         if (err) {
//                             reject(err);
//                         } else if(documents.docs.length === 0){
//                             reject(err);
//                         }
//                         else {
        
//                             // resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
//                             let list=documents.docs[0];
        
//                             list.face_suspicion=faceSuspicion;
//                             list.eye_suspicion=eyeSuspicion;
//                             list.tab_switches=tabSwitches;
        
//                             db.insert(list, (err, result) => {
//                                 if (err) {
//                                     logger.error('Error occurred: ' + err.message, 'create()');
//                                     reject(err);
//                                 } else {
//                                     resolve({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
//                                     console.log(result);
//                                 }
//                             });
                          
//                         }
//              });
//     })
   
// }

// updateReport(10,20,20,'h@gmail.com','afb2120a-95b7-46d3-a343-9db08a9005d3').then((status)=>{
//     console.log(status);
// }).catch()
