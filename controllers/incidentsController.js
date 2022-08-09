const Incident = require('../models/incident');
const IncidentAttachment = require('../models/incidentAttachment');
const Comment = require('../models/comment');
const CommentAttachment = require('../models/commentAttachment');
const WatchList = require('../models/watchList');
const Notification = require('../models/notification');
const User = require('../models/user');
var fs = require('fs');
var path = require('path');
const { search } = require('../routes/incidentsRoutes');


const incidentById = async (req, res) => {
  let id =  req.query.Id;

 let inc = await Incident.findById(id)     
      .catch(err => res.json(err));

  let incident = JSON.parse(JSON.stringify(inc)); // without it, cannot add new property in object. like attachments and comments

  incident.Attachments = await IncidentAttachment.find({IncidentId : id});

 incident.Comments = await Comment.find({IncidentId : id}).sort({'createdAt' : -1})
                            
 let commentsIds =[] 
 incident.Comments.map(c => {
  commentsIds.push(c._id);
 })

 let cAttachments = await CommentAttachment.find({ CommentId: { "$in" : commentsIds} });

 incident.Comments = incident.Comments.map(c => {
      let comment = JSON.parse(JSON.stringify(c));
      let attachs = cAttachments.filter(file => file.CommentId === comment._id); 
      comment.attachments = attachs? [].concat(attachs) : [];
      return comment;
 })
 
 res.json(incident);
 }
 //////////////////////////////////////////////////////////////////////////////////////////////////////
const addIncident = async (req, res) => {
  
  //console.log("req.body" , req.body);
  const incident = new Incident(req.body);
  var newIncident = await incident.save().catch(err => console.log(err));
  var id = newIncident._id;  

  if (!fs.existsSync(path.join( __dirname.replace("\controllers" , "") , './Attachments/Incidents/' + id))) {
    fs.mkdirSync(path.join( __dirname.replace("\controllers" , "") ,'./Attachments/Incidents/' + id), err => {       
      });
  }   

  req.files.forEach(file => {
    let path1 = path.join( __dirname.replace("\controllers" , "") ,'./Attachments/Incidents/' + id + '/'+ file.originalname);
    fs.writeFile(path1 , file.buffer, async ()=>{
      const incidentAttachment = new IncidentAttachment({
                                        FileName : file.originalname,
                                        ContentType : file.mimetype,
                                        IncidentId : id,
                                        Size : file.size
                                    });
      await incidentAttachment.save();
    })  
  });

  await addWatchList(id , req.body.AssignedTo);
  await addWatchList(id , req.body.CreatedBy);
  await addNotification(id , req.body.CreatedBy , req.body.AssignedTo, `[${ req.body.CreatedBy}] created an Incident and assigned it to you.`)

  res.status(200).json({
    Id : id
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const addComment = async (req, res) => {

  const comment = new Comment(req.body);
  var newComment = await comment.save().catch(err=>res.status(400).json(err));
  var id = newComment._id;  

  //// Notifications  
  await addWatchList( newComment.IncidentId , newComment.UserId);
  let watchers = await WatchList.find({IncidentId :  newComment.IncidentId});
  watchers.forEach(async watcher => {
    if(watcher.UserId !== newComment.UserId)
      await addNotification(newComment.IncidentId , newComment.UserId , watcher.UserId, `[${ newComment.UserId}] added a new comment. ${newComment.CommentText.slice(0, 20)}...`)
  })
  
  let comment_response = JSON.parse(JSON.stringify(newComment)); // without it, cannot add new property in object. like attachments

  comment_response.attachments = [];

  if(!req.files || req.files.length === 0)
       res.status(200).json(comment_response);  

  if (!fs.existsSync(path.join( __dirname.replace("\controllers" , "") , './Attachments/Incidents/'  + newComment.IncidentId +'/Comments/' + "/" + id))) {   
    fs.mkdirSync(path.join( __dirname.replace("\controllers" , "") ,'./Attachments/Incidents/'  + newComment.IncidentId +'/Comments/' + "/" + id),  {recursive: true}, err => {             
      });
  }   
  let fileCount = req.files.length;
  req.files.forEach(file => {

    let _path = path.join( __dirname.replace("\controllers" , "") ,
     '/Attachments/Incidents/'  + newComment.IncidentId +'/Comments/' + "/" + id + '/'+ file.originalname);
    fs.writeFile(_path , file.buffer, async ()=>{
      const commentAttachment = new CommentAttachment({
                                        FileName : file.originalname,
                                        ContentType : file.mimetype,
                                        CommentId : id,
                                        Size : file.size
                                    });
     let attch =  await commentAttachment.save();
     comment_response.attachments = [...comment_response.attachments , attch]    
    fileCount--;
    if(fileCount === 0)
      res.status(200).json(comment_response);
    })  
  });  
}
///////////////////////////////////  Notification ////////////////////
const addWatchList = async (incidentId , userId) => {
  const watchList = new WatchList({
    IncidentId: incidentId,  
    UserId: userId   
  });
  let watch = await WatchList.find({IncidentId : incidentId , UserId :  userId});
  if (watch.length === 0) {
    var watchlistAdded = await watchList
      .save()
      .catch((err) => console.log(err));
  }
  else{
   // console.log("User Already exists in watch list");
  }
}

const addNotification = async (incidentId , SourceUserId , userId, notifyAbout) => {
  const notification = new Notification({
    IncidentId: incidentId,
    SourceUserId: SourceUserId,
    IsRead: false,
    ReadDate: null,
    UserId: userId,
    NotifyAbout: notifyAbout
  });
  var newNotification = await notification.save().catch(err=> console.log(err));

}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const updateIncident = async (req, res) => {
  let field = req.body.Parameter;
  let incidentId = req.body.IncidentId;
  let value = req.body.Value;
  let userId = req.body.UserId;
  let = updateobj = {};
  switch(field.toLowerCase()){
    case 'assignedto':
      updateobj = {AssignedTo : value };
      break;
    case 'title':
      updateobj = {Title : value };
      break;
    case 'description':
      updateobj = {Description : value };
      break;
    case 'additionaldata':
      updateobj = {AdditionalData : value };
      break;
    case 'starttime':
      updateobj = {StartTime : value };
      break;
    case 'duedate':
      updateobj = {DueDate : value };
      break;
    case 'status':
      updateobj = {Status : value };
      break;
    default:
      updateobj = {};
  }

  let updateResult = await Incident.findOneAndUpdate({_id: incidentId}, { $set: updateobj}, {useFindAndModify: false}, ()=>{
  });

  await addWatchList( incidentId ,userId);
  let watchers = await WatchList.find({IncidentId :  incidentId});
  watchers.forEach(async watcher => {
    if(watcher.UserId !== userId)
      await addNotification(incidentId , userId , watcher.UserId, `[${ userId}] Updated ${field} on Incident: ${updateResult.Title.slice(0,20)}. `)
  })

  res.status(200).json(updateResult);  
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const updateComment = async (req, res) => {

   let commentId = req.body._id; 
  let updateobj = {CommentText : req.body.CommentText };   

  let updateResult = await Comment.findOneAndUpdate({_id: commentId}, { $set: updateobj}, {useFindAndModify: false}, ()=>{
  });

  await addWatchList( updateResult.IncidentId , updateResult.UserId);
  let watchers = await WatchList.find({IncidentId :  updateResult.IncidentId });
  watchers.forEach(async watcher => {
    if(watcher.UserId !== updateResult.UserId)
      await addNotification(updateResult.IncidentId , updateResult.UserId , watcher.UserId, `[${ updateResult.UserId}] updated a comment from an Incident.`)
  })
   
  res.status(200).json(updateResult);  
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const incidentsWithPage = async (req, res) => {
  let PageSize =  req.query.PageSize;
  let PageNumber =  req.query.PageNumber;
  let SortBy =  req.query.SortBy;
  let SortDirection =  req.query.SortDirection;
  let Search =  req.query.Search;

  let reg = `.*${Search}.*`;
  let regex = new RegExp(reg,'i');

  let total = await Incident.find({
    $or: [{ Title: regex }, { Description: regex }],
  }).countDocuments();

  let skip = PageSize * (PageNumber - 1); 
  let incidents = await Incident.find({
    $or: [{ Title: regex }, { Description: regex }],
  })
    .skip(skip)
    .limit(parseInt(PageSize))
    .sort({ createdAt: -1 });
  
  res.json({
    Incidents : incidents,
    Total_Incidents : total
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const downloadFile = (req, res) => {
  let type =  req.query.type;
  let CommentId =  req.query.commentId;
  let incidentId =  req.query.incidentId;
  let FileName =  req.query.filename;
  let ContentType =  req.query.ContentType;
  let filepath = "";
  if(!CommentId || CommentId =="") 
    filepath =path.join( __dirname.replace("\controllers" , "") ,
                  '/Attachments/Incidents/' + incidentId +  '/' + FileName);
  else
  filepath =path.join( __dirname.replace("\controllers" , "") ,
                  '/Attachments/Incidents/' + incidentId +  '/Comments/'+ CommentId + '/' + FileName);

  let dirpath = __dirname.replace("\controllers" , "");  
  res.download(filepath);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteFile = async (req, res) => {  
  let type =  req.query.type;
  let CommentId =  req.query.commentId;
  let incidentId =  req.query.incidentId;
  let FileName =  req.query.filename;
  let fileId =  req.query.fileId;   
 
  if(type !== "comment"){      
     let response =  await IncidentAttachment.deleteOne({_id : fileId});    
     await fs.unlink('./Attachments/Incidents/' + incidentId +  '/' + FileName, ()=>{   });
  } 
  else{   
    let response =  await CommentAttachment.deleteOne({_id : fileId});   
    await fs.unlink('./Attachments/Incidents/' + incidentId +  '/Comments/'+ CommentId + '/' + FileName, ()=>{  });
  } 
  res.json("Fiile Deleted");
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteComment = async (req, res) => {  
  let commentId =  req.query.commentId;
  let incidentId =  req.query.incidentId;
  let userId =  req.query.userId;
  
 let response =  await Comment.deleteOne({_id : commentId});
 response =  await CommentAttachment.deleteMany({CommentId : commentId});

 await addWatchList( incidentId , userId);
 let watchers = await WatchList.find({IncidentId :  incidentId });
 watchers.forEach(async watcher => {
   if(watcher.UserId !== userId)
     await addNotification(incidentId , userId , watcher.UserId, `[${ userId}] deleted a comment from an Incident.`)
 })
 
 fs.rmdirSync('./Attachments/Incidents/' + incidentId +  '/Comments/' + commentId, { recursive: true });
  
  res.json("Comment Deleted");
}
/////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////// Dashboard  ////////////////////////////////////////////////////////

const kpi = async (req, res) => {
  let userId = req.query.userId;

  let newIncidents = await Incident.find({ Status: "N" }).count();

  let inProgressIncidents = await Incident.find({ Status: "I" }).count();

  let lateIncidents = await Incident.find({
    $and: [
      { $or: [{ Status: "N" }, { Status: "I" }] },
      { DueDate: { $lt: new Date() } },
    ],
  }).count();

  let closedIncidents = await Incident.find({ Status: "C" }).count();

  let approvedIncidents = await Incident.find({ Status: "A" }).count();

  let AssignedToMe = await Incident.find({ AssignedTo: userId }).count();

  res.json({
    New: newIncidents,
    InProgress: inProgressIncidents,
    Closed: closedIncidents,
    Approved: approvedIncidents,
    Late: lateIncidents,
    AssignedToMe: AssignedToMe,
  });
};

 const overallWidget = async (req, res) => {
   let newIncidents = await Incident.find({ Status: "N" }).count();

   let inProgressIncidents = await Incident.find({ Status: "I" }).count();

   let lateIncidents = await Incident.find({
     $and: [
       { $or: [{ Status: "N" }, { Status: "I" }] },
       { DueDate: { $lt: new Date() } },
     ],
   }).count();

   let closedIncidents = await Incident.find({ Status: "C" })
     .count()
     .catch((err) => res.json(err));

   let approvedIncidents = await Incident.find({ Status: "A" }).count();

   res.json({
     New: newIncidents,
     InProgress: inProgressIncidents,
     Closed: closedIncidents,
     Approved: approvedIncidents,
     Late: lateIncidents,
   });
 };

 const last5Incidents = async (req, res) => {
   let incidents = await Incident.find().sort({ createdAt: -1 }).limit(5);
   res.json(incidents);
 };


 const oldest5UnresolvedIncidents = async (req, res) => {
  
  let incidents = await Incident.find({
    $or: [{ Status: "N" }, { Status: "I" }],
  })
    .sort({ createdAt: 1 })
    .limit(5);
  res.json(incidents);
  
 }


 const mostAssignedToUsersIncidents = async (req, res) => {

  let mostAssigned = await Incident.aggregate([
    { $group: { _id: "$AssignedTo", count: { $sum: 1 } } },
  ]).limit(5).sort({count:-1});

  let userIds =[] 
  mostAssigned.map(d => {
    userIds.push(d._id);
  })
 
  let users = await User.find({ _id: { "$in" : userIds} });

  let result  = [];
  mostAssigned.forEach(data => {
    let user = users.filter(u=> u._id == data._id)[0];
  
    result.push({
      UserId: data._id,     
      Name: user.FirstName + " " + user.LastName,
      Count: data.count,
    });
  });
 
  res.json(result);

 }


//////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  incidentById,
  addIncident,
  incidentsWithPage,
  addComment,
  updateIncident,
  downloadFile,
  updateComment,
  deleteFile,
  deleteComment,

  kpi,
  overallWidget,
  last5Incidents,
  oldest5UnresolvedIncidents,
  mostAssignedToUsersIncidents
}