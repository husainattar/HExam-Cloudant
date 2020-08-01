"use strict"
const {spawn} = require('child_process');
// const connection = require('../../config/db');
const db=require('../../config/cloudantdb');
const { uuid } = require('uuidv4');
const { resolve } = require('path');
const { connected } = require('process');

//Function-For-PythonCalling

function pythonFunction (value,question){
    //Here-python-worked-for-me-instead-of-python3
  return new Promise((resolve,reject)=>{

    const python = spawn('python', ['./web_plagiarism_check.py',value]);
    // collect data from script
    console.log("In-function-report");
    var report;
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        report = data.toString();
        report = report.split(" ");
        console.log(report);
        console.log(value);
        // let url =report.substring(report.indexOf("u")+1,report.indexOf(")")).replace("'",'');
        // let percent=report.substring(1,report.indexOf(","));
        let url = report[0];
        let percent = report[1];
        var plagiarismReport={
            "answer":value,
            "question":question,
            "percent":percent,
            "copiedFrom":url
        }
        resolve(plagiarismReport)
    });
    
    // in close event we are sure that stream from child process is closed
   
  })

}

let getPlagReport = async(content) => {
            var list=[]
            for(var item of content){
                if(item.isSubjective){
                    var getValue = await pythonFunction(item.answer,item.question);
                    list.push(getValue)
                }
            }
            return(list);
}



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
                                getPlagReport(test_content).then((plaglist)=>{
                                    list.plagiarism_report=plaglist;

                                    db.insert(list, (err, result) => {
                                        if (err) {
                                            logger.error('Error occurred: ' + err.message, 'create()');
                                            reject(err);
                                        } else {
                                            resolve({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                                            console.log(result);
                                        }
                                    });


                                }).catch();


                            }
                 });


        })
    },
    insert: async ({ name, email, filename }) => {

        return new Promise((resolve, reject) => {

            const url="https://hexam.eu-gb.mybluemix.net/";
            // const url="http://localhost:3000/"
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
    getPlagiarism : async({email, test_id }) =>{

        console.log("in-plagiarism")

        //write code to fetch the plagiarism report of student from his/her email and the the test id
        return new Promise((resolve,reject)=>{
            db.find({
                'selector': {
                    'type':"report",
                    'test_id':test_id,
                      }
                        }, (err, documents) => {
                            if (err) {
                                reject(err);
                                console.log(err);
                            } else if(documents.docs.length === 0){
                                reject(err);
                                console.log(err);
                            }
                            else {
            
                                // resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
                               var checklist=documents.docs.filter((data)=> {
                                   if(data.student_email != email)
                                   {
                                       return data;
                                   }
                                });
            
                               var i,j;
            
                               var Targetlist=documents.docs.filter((data)=>{
                                   if(data.student_email === email){
                                       return data.plagiarism_report;
                                   }
                               }).map(data=>data.plagiarism_report);
            
                               for(var j=0;j<checklist.length;j++){
                                     Targetlist[0]=UpdatedResult(Targetlist[0],checklist[j]);
                                   }
            
                                   var changelist=documents.docs.filter((data)=> {
                                    if(data.student_email === email)
                                    {
                                        return data;
                                    }
                                 });


            
                                 changelist[0].plagiarism_report=Targetlist[0];
    
                                //  console.log(changelist);
                                  let mainlist=changelist[0];
                                 db.insert(changelist[0], (err, result) => {
                                    if (err) {
                                        // logger.error('Error occurred: ' + err.message, 'create()');
                                        reject(err);
                                    } else {
                                       let ResultData={
                                            data: { plagiarism_report:mainlist.plagiarism_report,createdId: result.id, createdRevId: result.rev }, statusCode: 201
                                        }
                                        console.log(ResultData);
                                        resolve(ResultData);
                                        
                                    }
                                });
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


const LevenshteinDistance =  function(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 


    // console.log(a.length+1);
    // console.log(b);
    // var matrix = new Array((b.length+1)).fill(0).map(() => new Array((a.length+1 )).fill(0));
    var matrix=[]

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
            matrix[i][j] = matrix[i-1][j-1];
        } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
        }
    }

return matrix[b.length][a.length];
};

const plagiarismCheck=function (str1,str2){
  str1=str1.toLowerCase();
  str2=str2.toLowerCase();
  var  str1Len=str1.length;
  var  str1Lines=str1.split(".");
  var  str2Lines=str2.split(".");
  var  totalLcs=0;
    for(var iStr of str1Lines){
        var iStrMinDist=Number.MAX_VALUE;
        for(var jStr of str2Lines){
            iStrMinDist=Math.min(LevenshteinDistance(iStr,jStr),iStrMinDist);
            
        }
        // console.log(iStrMinDist)
        iStrMinDist=Math.min(iStrMinDist,iStr.length);
        totalLcs+=iStr.length-iStrMinDist;
    }

    return (totalLcs/str1Len)*100;
}

function UpdatedResult(Target,checklist){
    for(var i=0;i<Target.length;i++){
        var percent=plagiarismCheck(Target[i].answer,checklist.plagiarism_report[i].answer);
        if(percent>Target[i].percent){
            Target[i].percent=percent.toString();
            Target[i].copiedFrom=checklist.student_email;
        }
    }
    return Target;
}
