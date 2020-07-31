"use strict"
const {spawn} = require('child_process');
// const connection = require('../../config/db');
const db=require('../../config/cloudantdb');
const { uuid } = require('uuidv4');
/*
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
    updateReport: async ({ faceSuspicion, eyeSuspicion, tabSwitches,test_content, email, testId }) => {
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

                                list.plagiarism_report=[];

                                // Calling the python function for the Each Subjective-Answer
                                test_content.forEach((items,index)=>{
                                    if(items.isSubjective){
                                        // Calling python function
                                        const python = spawn('python', ['./web_plagiarism_check.py',items.answer]);
                                        // collect data from script
                                        var report;
                                        python.stdout.on('data', function (data) {
                                            console.log('Pipe data from python script ...');
                                            report = data.toString();
                                            // console.log(report);
                                        });

                                        // // in close event we are sure that stream from child process is closed
                                        python.on('close', (code) => {
                                        console.log(`child process close all stdio with code ${code}`);
                                        let url =report.substring(report.indexOf("u")+1,report.indexOf(")")).replace("'",'');
                                        let percent=report.substring(1,report.indexOf(","));
                                        // console.log(url);
                                        // console.log(percent);
                                        var plagiarismReport={
                                            "percentageCopied":percent,
                                            "urlUsed":url
                                        }
                                        list.plagiarism_report.push(plagiarismReport)
                                        console.log(list.plagiarism_report);
                                        // res.send(report)
                                        });                                       

                                    }
                                });

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
*/
async function pythonFunction (value){
    //Here-python-worked-for-me-instead-of-python3
  return new Promise((resolve,reject)=>{

    const python = spawn('python', ['./web_plagiarism_check.py',value]);
    // collect data from script
    console.log("In-function-report");
    var report;
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        report = data.toString();
        console.log(report);
        console.log(value);
    });
    
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    let url =report.substring(report.indexOf("u")+1,report.indexOf(")")).replace("'",'');
    let percent=report.substring(1,report.indexOf(","));
    // console.log(url);
    // console.log(percent);
    // let list=[];
    var plagiarismReport={
        "percentageCopied":percent,
        "urlUsed":url
    }
    // list.push(plagiarismReport)
    // console.log(plagiarismReport);
    resolve(plagiarismReport);
    // res.send(report)
    });
    



  })

}



////Used-to-create-Put-request

let updateReport = (faceSuspicion, eyeSuspicion, tabSwitches,test_content, email, testId)=>{
    return new Promise((resolve, reject) => {
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

                            list.plagiarism_report=[];
                            var flag=0;
                            for(var items of test_content){
                                if(items.isSubjective){
                                    console.log(items.answer);


                                    const python = spawn('python', ['./web_plagiarism_check.py',items.answer]);
    // collect data from script
    console.log("In-function-report");
    var report;
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        report = data.toString();
        console.log(report);
        // console.log(value);
    });
    
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    let url =report.substring(report.indexOf("u")+1,report.indexOf(")")).replace("'",'');
    let percent=report.substring(1,report.indexOf(","));
    // console.log(url);
    // console.log(percent);
    // let list=[];
    var plagiarismReport={
        "percentageCopied":percent,
        "urlUsed":url
    }
    // list.push(plagiarismReport)
    // console.log(plagiarismReport);
    list.plagiarism_report.push(plagiarismReport);
    // res.send(report)
    });
                                    
                                } 

                                
                                flag++;
                            }
                            resolve(list)
                        }
             });
    })
   
}
var test_content=[
    {"isSubjective":true,
     "question":"Multithreading",
     "answer":"A Thread is small piece of task"
  },{
    "isSubjective":true,
    "question":"overriding",
    "answer":"When we over a method in subclass"
  },{
    "isSubjective":false,
    "question":"Multithreading",
    "answer":"a"
  }
]

updateReport(10,20,20,test_content,'tanish.s@somaiya.edu','afb2120a-95b7-46d3-a343-9db08a9005d3').then((list)=>{
    db.insert(list, (err, result) => {
        if (err) {
            logger.error('Error occurred: ' + err.message, 'create()');
            console.log(err);
        } else {
            console.log({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
            console.log(result);
        }
    });
}).catch()
