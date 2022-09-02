var mysql=require("mysql");

var con =mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"115298",
    database:"coviddb"
});
con.connect(function (err) {
    //connect to the database
    if (err) throw err;
    console.log("connected!"); 
  });
const express =require('express');
const bodyParser = require("body-parser");
const app =express();
app.use(bodyParser.urlencoded({ 
    extended:true
})); 
const url=require('url');
const { callbackify } = require("util");

app.get("/",(req,res)=>{  // '/labtech' use this url access : //http://localhost:3000/labtech
    loginPage(req,res);
});
app.post("/",(req,res)=>{
    let query =url.parse(req.url,true).query;
    var id = req.body.labid; 
    var pass = req.body.password;
    let
        s = `SELECT log.labID
                  FROM labemployee log
                  WHERE log.password=`+ pass +` AND log.labID=` +id +`;`;//(pass&id is char error when it is int)
    
    con.query(s, function(err,result){
        if (err) throw err;
               if(result.length==1){
                res.redirect('/LabPage');
            }
            
       
    });
});
app.get("/LabPage",(req,res)=>{
    labHome(req,res);
});
app.get("/TestCollectPage",(req,res)=>{
    TestCollectPage(req,res);
});
app.get("/PoolMapPage",(req,res)=>{
    PoolMapPage(req,res);
});
app.get("/WellTestPage",(req,res)=>{
    WellTestPage(req,res);
});
app.get("/EmployeeLoginPage",(req,res)=>{ //http://localhost:3000/EmployeeLoginPage
    EmployeeLoginPage(req,res);
});
app.post("/EmployeeLoginPage",(req,res)=>{
    let query =url.parse(req.url,true).query;
    var email = req.body.email; 
    var pass = req.body.Password;
    let
        s = `SELECT log.employeeID
                  FROM employee log
                  WHERE log.passcode=`+ pass +` AND log.email=` +email +`;`;
    
    con.query(s, function(err,result){
        if (err) throw err;
               if(result.length==1){
                res.redirect('/EmployeeResultPage');
            }
            //add alert if input invalid
            
       
    });
});

app.get("/EmployeeResultPage",(req,res)=>{
    EmployeeResultPage(req,res);
});
port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log("server started");
});


//****************************************************************************** */
//Login Page
//****************************************************************************** */
function loginPage(req,res){
    res.writeHead(200,{"Content-Type":"text/html"});
    let query =url.parse(req.url,true).query;

    //let labId =query.labId ? query.labId :"";
    //let password= query.password ? query.password :"";
    //let submitType =query.submitType ? query.submitType :"";
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
        <title>Lab Employee Login Page </title>
        <style type = text/css>
            table{
                border-collapse: collapse;
                width: 50%;
            }
            table,td,th{
                border: 1px solid black;
                padding: 6px 10px 6px 10px;
                text-align: center;
            }
            table th{
                padding: 4px 10px 4px 10px;
            }
            
    
        </style>
    </head>
    <body>
            <h1>Lab Employee Login Page</h1>
            <form id="submitForm" method="post" action="/">
                <b>Lab ID: </b>
                <input type="text" name="labid" ><br><br>
                <b>Password: </b>
                <input type="text" name="password"><br><br>
                
               
            <br><br>
           
            
            <input type="submit" value="Lab Login" name="submitType" >
            
        </form>
        
        
        
    `;
    //console.log(query.labid);
    //console.log(query.password);
    
       res.write(html + `</body> </html>`);
      //  console.log(html);
            
      res.end();

}


//****************************************************************************** */
//Lab Page 
//****************************************************************************** */
function labHome(req,res){
    let query = url.parse(req.url,true).query;
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
        <title>SBU Covid19 Test Lab Home</title>
    </head>
    <body>
        <h1>Lab Home</h1>
        <form action="/TestCollectPage" method="get">
            <a type="submit" href="/TestCollectPage">Test Collection</a>
            </form>

            <form action="/PoolMapPage" method="get">
            <a type="submit" href="/PoolMapPage">Pool Mapping</a>
            </form>

            <form action="/WellTestPage" method="get">
            <a type="submit" href="/WellTestPage">Well testing</a>
            
        
    
    `
    res.write(html+ "\n\n</body>\n</html>");
    res.end();
}


//****************************************************************************** */
//Test Collect Page 
//****************************************************************************** */

function TestCollectPage(req,res){
    let query = url.parse(req.url,true).query;
    let employeeID=query.employeeID ? query.employeeID :"";
    let testBarcode=query.testBarcode ? query.testBarcode :"";
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
        <title>SBU Covid19 Test Collect Page</title>
        <style>
        div {
        border: 1px solid black;
        }
        table, td, th {
                border: 2px solid black;
                }
                table {
                border-collapse: collapse;
                width: 100%;
                }
        </style>

        </head>
    <body>
        <h1>SBU Covid19 Test Collection</h1>
        <form method="get" action="/TestCollectPage">
            <b>Employee ID: </b>
            <input type="text" placeholder="Enter Employee ID" name="employeeID" id="employeeID"><br><br>
            <b>Test Barcode: </b>
            <input type="text" placeholder="Enter Test Barcode" name="testBarcode" id="testBarcode"><br><br>
            <input type="submit" value="add">
            
        </form>
        <form method="get" action="/TestCollectPage">
        <table style="width:100%;">
        <tr>
                <th>Employee ID</th>
                <th>Test Barcode</th>
                </tr>`;
        

    let table = `SELECT * FROM employeetest;`; //table without updates
    let table1 = `SELECT *
    FROM employee emp
    WHERE emp.employeeID="` +employeeID+`"`; //check if id exist in the record
    con.query(table1, function (err, empid) {
        if (err) throw err; //empid will give the length of the id exsit in the record
        table1 = `SELECT *
        FROM employeetest col
        WHERE col.employeeID="` +employeeID +`" AND col.testBarcode="` +testBarcode +`"`; //check if the table has more than one testbarcode
        con.query(table1, function (err, bar) {
            if (err) throw err;//bar gives the number of barcode in table
            if(empid.length==1&&bar.length==0){//exist in empolyee and there is no repeated testbarcode in employeetest
                var fulldate = new Date();
                var datetime = `'`+fulldate.getFullYear()+`-`+fulldate.getMonth()+`-`+fulldate.getDate()+` `+fulldate.getHours()+`:`+fulldate.getMinutes()+`:`+fulldate.getSeconds()+`'`;
                table1 =`INSERT INTO employeetest (testBarcode, employeeID, collectionTime) 
                                VALUES ('` +testBarcode +`', '`+employeeID +`',`+ datetime+`);`;//insert into table
            }
            if(query.del){
               table1 = `DELETE FROM employeetest WHERE testBarcode='`+query.del+`';`;
               //or check if it exist in pool, if so do not delete : use like for findinf the same testbar in poolmap
            }

            con.query(table1, function (err, result) {//updated the table
                if (err) throw err;
                con.query(table, function(err,result){
                    if (err) throw err;
                    //console.log(result.length);
                            for (var i = 0; i < result.length; i++) {
                                html += `<tr>
                                <td><input type="radio" name="del" value="`+result[i].testBarcode+`">`+result[i].employeeID+`</td>
                                  <td>`+result[i].testBarcode+`</td>
                                </tr>`;
                             }
                             html+= `</table>`;
                             res.write(html+`<input type="submit" value="Delete"></form>\n\n</body>\n</html>`);
                            res.end();
                            });
            });
        });
    });
}

//****************************************************************************** */
//Pool Map Page
//****************************************************************************** */
function PoolMapPage(req,res){
    let query = url.parse(req.url,true).query;
    //let poolBarcode=query.poolBarcode ? query.poolBarcode :"";
    //let testBarcode=query.testBarcode ? query.testBarcode :"";
    //let testBarArr=[];
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
    <style>
    div {
    border: 1px solid black;
    }
    table, td, th {
            border: 2px solid black;
            }
            table {
            border-collapse: collapse;
            width: 100%;
            }
    </style>

    </head>

    <body>
    <form>
        <h1>Pool Mapping</h1>
        <form method="get" action="/PoolMapPage">
        <b><label for="find">Pool barcode:</label>
        <input type="text" name="poolBarcode">
        <br>
        <b>Test Barcodes:
        <table id="tempPoolMap">
        <tr><th><input type='text' name='testBarcode'></th><th><input type='button' onclick='deleteRow(this)' value='delete' ></th></tr>
        </table>

        <input type="button" name="addtest"value="Add more rows" onclick="addrow()"><br><br>
        <script>
            function deleteRow(r){
                var i = r.parentNode.parentNode.rowIndex;
                document.getElementById("tempPoolMap").deleteRow(i);
            }
            function addrow(){
                var table=document.getElementById("tempPoolMap");
                var row = table.insertRow(0);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = "<input type='text' name='testBarcode'>";
                cell2.innerHTML = "<input type='button' onclick='deleteRow(this)' value='delete' >";
            };
        </script>
        <input type="submit" value="Submit" name="submit"><br><br>
        </form>
        <form method="get" action="/PoolMapPage">
        <table style="width:100%;">
        <tr>
                <th>Pool Barcode</th>
                <th>Test Barcode</th>
                </tr>`;
        //query.testBarcode : a list of input testbar
        //query.poolbar: valid poolbar that is going to be in pool then map
        //let pool = `SELECT * FROM pool;`; //pool
        let poolBarcode=query.poolBarcode ? query.poolBarcode :"";
        let testBarcode=query.testBarcode ? query.testBarcode :"";
        let testlength = query.testBarcode ? (query.testBarcode).length : -1;
        console.log(testlength);
        let table = `SELECT * FROM poolmap ;`; //table without updates
        let table1 = `SELECT * FROM pool tg
        WHERE tg.poolBarcode="` +poolBarcode+`"`;//check if poolBar already exist in pool
        con.query(table1, function (err, exist) { 
            console.log("1");
            if (err) throw err;
            //exist : length of the matching poolbarcode in pool
        table1 = `SELECT * FROM employeetest`;
        for(var i = 0; i < testlength; i++){//a sql of all the match testbar in empolyeetest
            if(!table1.includes("WHERE")){
                table1 += ` col WHERE `;
            }
            table1 += ((i>0) ? ' OR col.testBarcode="' : 'col.testBarcode="') + query.testBarcode[i] + `"`;
        }
        con.query(table1, function (err, match) { 
            console.log("2");
            if (err) throw err;//match gives the number od testbar that is match
            if(match.length==testlength&&match.length!=0&&testlength!=0&&query.poolBarcode&&exist.length==0){//both is not empty and equal length and poolBar exist
                table1 = `INSERT INTO pool VALUES ('` +query.poolBarcode + `');`;//insert pool
               //query table1 even if it is employeetest or insert pool
            }
            con.query(table1, function (err, update) { 
                console.log("3");
                if (err) throw err;//check if poolbarcode that suppose to insert exist in pool
                table1 = `SELECT * FROM pool tg
                WHERE tg.poolBarcode="` +poolBarcode+`"`;//see if successfully insert into pool
                con.query(table1, function (err, pool) { 
                    console.log(pool);
                    if (err) throw err;
                    if(pool.length==1){//pool bar exist in pool
                        table1 =`INSERT INTO poolmap (testBarcode, poolBarcode)
                        VALUES`;
                        for(var i=0;i<query.testBarcode.length;i++){ //insert each pair into poolmap
                            table1 += `('`+query.testBarcode[i]+`','`+query.poolBarcode+`')` + ((i==query.testBarcode.length-1) ? ';' : ', ') ;
                        }

                    }

                    if(query.del){
                        //collect all testcode of the delltete or edit poolbar
                        //if(query.deletepool){//if delete is clicked
                            table1 = `SELECT testBarcode FROM poolmap test WHERE test.poolBarcode=`+query.del+`;
                            DELETE FROM poolmap WHERE poolBarcode NOT IN(SELECT w.poolBarcode FROM welltesting w
                            WHERE w.poolBarcode=`+query.del+`) AND poolBarcode=`+query.del+`;
                            DELETE FROM pool WHERE poolBarcode NOT IN
                            (SELECT w.poolBarcode FROM welltesting w
                            WHERE w.poolBarcode=`+query.del+`) AND poolBarcode=`+query.del+`;`;
                        //}
                        //table1 = `DELETE FROM employeetest WHERE testBarcode='`+query.del+`';`;
                        //or check if it exist in pool, if so do not delete : use like for findinf the same testbar in poolmap
                        
                    }
                    
                    con.query(table1, function (err, up) { //either inserted into poolmap or stay the same
                        if (err) throw err;
                       
                        if(query.edit){//if edit is click then up will have table of testcodes that needs to be edit
                            //show on textbox
                            //replace the poolbar textbox with selected radio poolbar
                            //console.log(up);
                            //console.log("xx"+up.length);
                           let edittest ='';
                          // console.log("try"+up[0][0].testBarcode);
                           for(var j = 0; j < up[0].length; j++){
                               //for(let test of up){
                            console.log("??:"+edittest);
                            //console.log(test.testBarcode);
                            console.log("try"+up[0][j].testBarcode);
                           edittest += `<tr><th><input type="text" name="testBarcode" value="`+up[0][j].testBarcode+`"></th><th><input type="button" onclick="deleteRow(this)" value="delete" ></th></tr>`;
                           }console.log("?x?:"+edittest);
                           html = html.replace(`<tr><th><input type='text' name='testBarcode'></th><th><input type='button' onclick='deleteRow(this)' value='delete' ></th></tr>`,edittest);
                           html = html.replace(`<input type="text" name="poolBarcode">`, `<input type="text" name="poolBarcode" value="`+query.del+`"></input>`); 
                           console.log(html);
                        }




                        //where printing the table v
                        let pool = `SELECT poolBarcode, 
                        GROUP_CONCAT(testBarcode) as "testBarcode" 
                        FROM poolmap group by poolBarcode;`; //pool
                        //let str = '';
                        con.query(pool, function (err, each) { //either inserted into poolmap or stay the same
                            if (err) throw err;
                                    for (var i = 0; i < each.length; i++) {
                                    
                                        //console.log(str);
                                        html += `<tr>
                                        <td><input type="radio" name="del" value="`+each[i].poolBarcode+`">`+each[i].poolBarcode+`</td>
                                          <td>`+each[i].testBarcode+`</td>
                                        </tr>`;
                                     }
                                     
                                     html+= `</table>`;
                                     res.write(html+`<input type="submit" value="Edit pool" name="edit">
                                     <input type="submit" value="Delete pool" name="deletepool"></form>\n\n</body>\n</html>`);
                                    res.end();
                                    });
                            //    });
                    });

                });
            });
        });
    });
        

        
}
//****************************************************************************** */
//Well Test Page
//****************************************************************************** */
function WellTestPage(req,res){

    let query = url.parse(req.url,true).query;
    let wellbar =query.wellbar ? query.wellbar :"";
    let poolbar =query.poolbar ? query.poolbar :"";
    let html=`
    <!DocTYPE html>
    <html lang="en">

    <head>
    <title> Well testing </title>
    <style type = text/css>
        table{
            border-collapse: collapse;
            width: 50%;
        }
        table,td,th{
            border: 1px solid black;
            padding: 6px 10px 6px 10px;
            text-align: center;
        }
        table th{
            padding: 4px 10px 4px 10px;
        }
        

    </style>
    <script>
        function addWell(){
            var table =document.getElementById("welltable");
            var row=table.insertRow();
            var cell1=row.insertCell(0);
            var cell2=row.insertCell(1);
            var cell3=row.insertCell(2);
            cell1.innerHTML=document.getElementById("wellbar").value;
            cell2.innerHTML=document.getElementById("poolbar").value;
            cell3.innerHTML=document.getElementById("result").value;
        }
    </script>
    </head>
    <body>
            <h1>Well testing</h1>
            <form method="get" action="/Welltesting">
                <b>well barcode: </b>
                <input type="text" name="wellbar" id="wellbar"><br><br>
                <b>Poll barcode: </b>
                <input type="text" name="pollbar" id="poolbar"><br><br>
                
                <b>Result: </b>&emsp;
            <select name = "Result" id="result">
                <option value = "in_progress">in progress</option>
                <option value = "negative">negative</option>
                <option value = "positive">positive</option>
            </select>
            <br><br>&emsp;
            <input type= "button" value="Add" onclick="addWell()">
        </form>

    <br><br>
        <table id="welltable">
            <tr>
                <th> Well barcode</th>
                <th> Pool barcode </th>
                <th> Result </th>
                
            </tr>
            <tr>
                
            </tr>
            </table>
            <br><br>
            <button name = "add" value="` + wellbar+`"> Edit </button>&emsp;&emsp;
            <button name = "add" value="` + wellbar+`"> Delete </button>
        
    
    `
    res.write(html+ "\n\n</body>\n</html>");
    res.end();
}
//****************************************************************************** */
//Employee Login Page
//****************************************************************************** */
function EmployeeLoginPage(req,res){
    let query = url.parse(req.url,true).query;
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
        <title> Employee Login page for Results </title>
        <style type = text/css>
            table{
                border-collapse: collapse;
                width: 50%;
            }
            table,td,th{
                border: 1px solid black;
                padding: 6px 10px 6px 10px;
                text-align: center;
            }
            table th{
                padding: 4px 10px 4px 10px;
            }
            
    
        </style>
    </head>
    <body>
            <h1>Employee Login page for Results</h1>
            <form method="post" action="/EmployeeLoginPage">
                <b>Email: </b>
                <input type="text" name="email"><br><br>
                <b>Password: </b>
                <input type="text" name="Password"><br><br>
                
                
            <br><br>
            <input type="submit" value="Login" name="submitemployee" >
        </form>
        
    
    `
    res.write(html+ "\n\n</body>\n</html>");
    res.end();
}

//****************************************************************************** */
//Employee Result Page 
//****************************************************************************** */
function EmployeeResultPage(req,res){
    let query = url.parse(req.url,true).query;
    let html=`
    <!DocTYPE html>
    <html lang="en">
    <head>
        <title> Employee Login page for Results </title>
        <style type = text/css>
            table{
                border-collapse: collapse;
                width: 50%;
            }
            table,td,th{
                border: 1px solid black;
                padding: 6px 10px 6px 10px;
                text-align: center;
            }
            table th{
                padding: 4px 10px 4px 10px;
            }
            
    
        </style>
    </head>
    <body>
        <h1>Employee home</h1>
        <table>
            <tr>
                <th> Collection Day</th>
                <th> Result </th>
                
            </tr>
            <tr>
                
            </tr>
            </table>

        
    
    `
    res.write(html+ "\n\n</body>\n</html>");
    res.end();
}