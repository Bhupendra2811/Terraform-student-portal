// index.js
const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { v1: uuidv1 } = require("uuid");
const cors = require("cors");
const AWS = require("aws-sdk");
// const jwt_decode = require("jwt-decode");
const { use } = require("express/lib/application");
AWS.config.update({ region: "ap-south-1" });
(UserPoolId = "ap-south-1_olSEdsCUs"),
  (ClientId = "5ipbhafnb88k62h59v9sfkqgc4");

const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({});
function adminAddUserToGroup({ UserPoolId, username, groupName }) {
  COGNITO_CLIENT.adminAddUserToGroup({
    GroupName: groupName,
    UserPoolId,
    Username: username,
  }).promise();
}
/////////////////////////////////////////
///////////////////////////////////////////////////
const USERS_TABLE = process.env.USERS_TABLE || "T_Student";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

  // res.jwtpayload = jwt_decode(req.headers.authorization);
app.post("/createuser", async function (req, res) {
  const { username, email, password, groupName, department, classNo } =
    req.body;

  var poolData = {
    UserPoolId,
    Username: username,
    TemporaryPassword: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
    MessageAction: "SUPPRESS",
  };
  await COGNITO_CLIENT.adminCreateUser(poolData).promise();

  await COGNITO_CLIENT.adminAddUserToGroup({
    UserPoolId,
    Username: username,
    GroupName: groupName,
  }).promise();

  if (groupName == "Student") {
    var params = {
      TableName: "T_Student",
      Item: {
        studentId: uuidv1(),
        ssk: "User Attributes",
        username,
        email,
        department,
        classNo,
      },
    };
    await dynamoDb.put(params).promise();
  }

  res.status(200).json({ message: "success" });
});
//Create student details
app.post("/studentdetails/:studentId", function (req, res) {
  const { title, value } = req.body;
  var params = {
    TableName: "T_Student",
    Item: {
      studentId: req.params.studentId,
      ssk: title,
      value,
    },
  };
  dynamoDb
    .put(params)
    .promise()
    .then((data) => res.json(data));
});

//dynamoDB student Details
app.get("/students", function (req, res) {
  dynamoDb.scan({ TableName: USERS_TABLE }, function (err, data) {
    if (err) res.send(err.message);
    else {
      res.json(data);
    }
  });
});

// app.get("/", async function(req,res) {
//   const {email,username,department,classNo} = {email: "hello@gmail.com ",username:"abc",department:"eng",classNo:"a"}
//   var params = {
//     TableName: 'Students',
//     Item: {
//       'studentId' :uuidv1(),
//       'ssk':"User Attributes",
//       username,
//       email,
//       department,
//       classNo
//     }
//   };
//   await dynamoDb.put(params, function(err, data) {
//     if (err) {
//       res.json({err})
//     } else {
//       res.json({data})
//     }
//   }).promise();
// })

// app.get('/faculty',function(req,res){

// })

///dynamoDb update values
app.post("/students/:studentId", function (req, res) {
  var params = {
    TableName: USERS_TABLE,
    Key: {
      studentId: req.body.studentId,
      ssk: "User Attributes",
    },
    UpdateExpression: "set department = :department, classNo = :classNo",
    ExpressionAttributeValues: {
      ":department": req.body.department,
      ":classNo": req.body.classNo,
    },
  };

  dynamoDb
    .update(params)
    .promise()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});
module.exports.handler = serverless(app);
