"use strict"
const {spawn} = require('child_process');
// const connection = require('../../config/db');
const db=require('../../config/cloudantdb');
const { uuid } = require('uuidv4');
const { resolve } = require('path');


/*
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
        console.log(report);
        console.log(value);
        let url =report.substring(report.indexOf("u")+1,report.indexOf(")")).replace("'",'');
        let percent=report.substring(1,report.indexOf(","));
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
     "answer":"A Thread is small piece of process"
  },{
    "isSubjective":true,
    "question":"overriding",
    "answer":"When we over a method of class"
  },{
    "isSubjective":false,
    "question":"Multithreading",
    "answer":"a"
  }
]

updateReport(10,20,20,test_content,'h@gmail.com','afb2120a-95b7-46d3-a343-9db08a9005d3').then((list)=>{
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

*/




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
var targetlist=[
    {
    "student_email":"h@gmail.com",
     "plagiarism_report":[
        { 
            "answer":"A Thread is small piece of task",
            "percent": '100',
            "copiedFrom": "http://www.drdobbs.com/parallel/use-thread-pools-correctly-keep-tasks-sh/216500409'"
          },
          {
            "answer":"Hi Usai",
            "percent": '10',
            "copiedFrom": "https://www.geeksforgeeks.org/overriding-in-java/'"
          }
     ]
  },
  {
    "student_email":"tanish@gmail.com",
     "plagiarism_report":[
        { 
            "answer":"A Thread is small piece of process",
            "percent": '100',
            "copiedFrom": "http://www.drdobbs.com/parallel/use-thread-pools-correctly-keep-tasks-sh/216500409'"
          },
          {
            "answer":"Hi Hussain",
            "percent": '10',
            "copiedFrom": "https://www.geeksforgeeks.org/overriding-in-java/'"
          }
     ]
  }
]

let updateReport = ( getemail, testId)=>{
    return new Promise((resolve, reject) => {
        db.find({
            'selector': {
                'type':"report",
                'test_id':testId,
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
        
                           var email=getemail;
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

                             resolve(changelist[0]);
        
                            //  db.insert(changelist, (err, result) => {
                            //     if (err) {
                            //         // logger.error('Error occurred: ' + err.message, 'create()');
                            //         reject(err);
                            //     } else {
                            //         resolve({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                            //         console.log(result);
                            //     }
                            // });
                        }
             });
    })
};

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

updateReport("h@gmail.com","afb2120a-95b7-46d3-a343-9db08a9005d3").then((list)=>{
    console.log(list);
     db.insert(list, (err, result) => {
                                if (err) {
                                    // logger.error('Error occurred: ' + err.message, 'create()');
                                    console.log(err);
                                } else {
                                    console.log({ data: {plagiarism_report:list.plagiarism_report, createdId: result.id, createdRevId: result.rev }, statusCode: 201 });
                                    console.log(result);
                                }
                            });
}).catch()





