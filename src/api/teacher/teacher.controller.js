'use strict';
// const connection = require('../../config/db')
const db=require('../../config/cloudantdb');

module.exports = {
    ifExists: async ({ email, pass }) => {
        return new Promise((resolve, reject) => {
            // connection.execute('SELECT email FROM teachers WHERE email = ? AND pass = ?', [email, pass], (err, rows, fields) => {
            //     if (err)
            //         reject(err)
                
            //     if (rows.length == 0)
            //         reject("no account found")    
            //     else
            //         resolve("account found")
            // })  
            db.find({
                'selector': {
                    'type': "teacher",
                    'email': email,
                    'pass':pass
                }
            }, (err, documents) => {
                if (err) {
                    console.log("In+here+not-found");
                    reject(err);
                } else {
                    if(documents.docs.length === 0)
                    {
                        console.log(documents);
                        reject("no account found");
                       
                    }else{
                        console.log(documents);
                    resolve("account found");
                    }
                                    
                }
            });

        })
    }
}