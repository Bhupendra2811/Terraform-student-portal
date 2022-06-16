// index.js
const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { v1: uuidv1 } = require("uuid");
const cors = require("cors");
const AWS = require("aws-sdk");
const { use } = require("express/lib/application");
AWS.config.update({ region: "ap-south-1" });
(UserPoolId = "ap-south-1_imwV6cZNn"),
  (ClientId = "3oulu935701glf6nuncfsbqgkc");

const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({});
function adminAddUserToGroup({ UserPoolId, username, groupName }) {
  COGNITO_CLIENT.adminAddUserToGroup({
    GroupName: groupName,
    UserPoolId,
    Username: username,
  }).promise();
}

// AWS.config.update({
//   accessKeyId: "AKIAT3NZ4P4CXBLHP55I",
//   secretAccessKey: "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",
//   region: "ap-south-1"
// });

/////////////////////////////////////////
///////////////////////////////////////////////////
const USERS_TABLE = process.env.USERS_TABLE || "Students";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
      TableName: "Students",
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
    TableName: "Students",
    Item: {
      studentId: req.params.studentId,
      ssk: title,
      value,
    },
  };
   dynamoDb.put(params).promise().then(data=>res.json(data));
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
app.listen(5000, console.log("Server chaalu che http://localhost:5000"));

module.exports.handler = serverless(app);
