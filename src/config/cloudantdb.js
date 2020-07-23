const vcap = require('./vcap-local.json');
const url=vcap.services.cloudantNoSQLDB.credentials.url;

var Cloudant = require('cloudant');
var cloudant = Cloudant(url);
let db = cloudant.use('hexamdb');
// const { uuid } = require('uuidv4');

// console.log(db);

module.exports=db;
// var p= new Promise((resolve, reject) => {

//     // connection.execute('INSERT INTO students VALUES(?,?,?)', [email, name, "http://localhost:3000/uploads/"+filename ], (err, result) => {
//     //     if (err)
//     //         reject(err)
//     //     else
//     //         resolve({ email: email, name: name, path: "http://localhost:3000/uploads/" + filename})
//     // })

//     let listId = '123455';
//     let imgpath = "http://localhost:3000/uploads/" + 'filename';
//     let list = {
//         _id: listId,
//         id: listId,
//         type: 'student',
//         email: 'email',
//         name: 'name',
//         path: imgpath
//     };
//     db.insert(list, (err, result) => {
//         if (err) {
//             // logger.error('Error occurred: ' + err.message, 'create()');
//             reject(err);
//         } else {
//             console.log(result)
//             resolve(result);
//         }
//     });

// })