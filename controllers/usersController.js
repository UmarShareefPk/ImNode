const User = require('../models/user');
const UserLogin = require('../models/userlogin');
var jwt = require('jsonwebtoken');
var config = require('../config');
var fs = require('fs');

const login = async (req, res) => {
 
  var userlogin = await UserLogin.find({Username : req.body.username , Password : req.body.password})
  
   if (userlogin.length === 0) 
     res.json("Invalid username or password");

  const loginInfo = userlogin[0];

  var user = await User.findById(loginInfo.UserId);

 var token = jwt.sign({userId : loginInfo.UserId}, config.secret, {
  expiresIn: 86400 // expires in 24 hours
});

res.status(200).send({ 
                      Id :  loginInfo.UserId,
                      user : user,
                      Token : token 
                    });
}

const userById = (req, res) => {

 var token = req.headers["x-access-token"];
 if (!token)
   return res.status(401).send({ auth: false, message: "No token provided." });

 jwt.verify(token, config.secret, function (err, decoded) {
   if (err)
     return res
       .status(500)
       .send({ auth: false, message: "Failed to authenticate token." });

   res.status(200).send(decoded);
 });

  User.findById(req.params.id)
      .then(r => res.json(r))
      .catch(err => res.json(err))
 }

 const allUsers = (req, res) => {  
   User.find()
       .then(r => res.json(r))
       .catch(err => res.json(err))
  }


const addUser1 = (req, res) => {
  const user = new User({
    CreateDate : new Date(),
    FirstName : "Ali",
    LastName : "Ashraf",
    ProfilePic : "test",
    Email : "Ali.Ashraf@gmail.com",
    Phone : "03236006334"
  });

  user.save()
      .then((r)=> {
        res.json(r);
       })
       .catch(err => {
         res.json(r);
       });
}

const addUserLogin = (req, res) => {
  const userlogin = new UserLogin({
    UserId : "6025a25dc3fe122284bfb351",
    Username : "ali",
    Password : "password"   
  });

  userlogin.save()
      .then((r)=> {
        res.json(r);
       })
       .catch(err => {
         res.json(r);
       });
}

const updateSocketId = async (req, res) => {

  let updateResult = await User.findOneAndUpdate({_id: req.body.UserId}, { $set: {SocketId :  req.body.SocketId}}, {useFindAndModify: false}, ()=>{
  });
  //console.log(updateResult);
}

 //////////////////////////////////////////////////////////////////////////////////////////////////////

 const addUser = async (req, res) => {
  
  //console.log("req.body" , req.body);
  let u = JSON.parse(JSON.stringify(req.body)); 
  u.ProfilePic = req.files.length > 0? req.files[0].originalname : "";

 // console.log("u req.files", req.files);

  const user = new User(u);
  var newUser = await user.save().catch(err => console.log(err));
  var id = newUser._id;  

  if (!fs.existsSync('./Attachments/Users/' + id)) {
    fs.mkdirSync('./Attachments/Users/' + id, err => {      
    //  console.log("folder created."); 
      });
  }   

  req.files.forEach(file => {
    let path = './Attachments/Users/' + id + '/'+ file.originalname
    console.log("path", path);
    fs.writeFile(path , file.buffer, async ()=>{    
    //  console.log("file created.");   
    })  
  });
 
  res.status(200).json({
    Id : id
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const usersWithPage = async (req, res) => {
 
  let PageSize =  req.query.PageSize;
  let PageNumber =  req.query.PageNumber;
  let SortBy =  req.query.SortBy;
  let SortDirection =  req.query.SortDirection;
  let Search =  req.query.Search;

  let reg = `.*${Search}.*`
  let regex = new RegExp(reg,'i')

  let total = await User.find( {$or : [{ FirstName : regex}, { LastName : regex}] }).countDocuments();
  let skip = PageSize * (PageNumber - 1); 

  let users = await User.find({$or : [{ FirstName : regex}, { LastName : regex}] }).skip(skip).limit(parseInt(PageSize)).sort({'createdAt' : -1});

  res.json({
    Users : users,
    Total_Users : total
  });
}

module.exports = {
  login,
  userById,
  allUsers,
  addUser,
  addUserLogin,
  updateSocketId,
  usersWithPage

}