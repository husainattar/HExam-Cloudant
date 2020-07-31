"use strict"
const {spawn} = require('child_process');
// const connection = require('../../config/db');
const db=require('../../config/cloudantdb');
const { uuid } = require('uuidv4');
const { resolve } = require('path');

c


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

                            getPlagReport(test_content).then((plaglist)=>{
                                list.plagiarism_report=plaglist
                                console.log(list)
                                resolve(list);
                            }).catch();

                            // getPlagReport(test_content).then((plaglist)=>{
                            //     list.plagiarism_report=plaglist;
                            //     resolve(list);
                            // }).catch();
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