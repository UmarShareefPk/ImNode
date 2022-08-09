const express = require('express');
const incidentsController = require('../controllers/incidentsController');
let multer = require('multer');
let upload = multer();

const router = express.Router();

 router.get('/incidentById', incidentsController.incidentById);
 router.post('/addincident', upload.any() , incidentsController.addIncident);
 router.post('/updateIncident', upload.any() , incidentsController.updateIncident);
 router.post('/updateComment', upload.any() , incidentsController.updateComment);
 router.post('/addComment', upload.any() , incidentsController.addComment);
 router.get('/incidentsWithPage', incidentsController.incidentsWithPage);
 router.get('/downloadFile', incidentsController.downloadFile);
 router.get('/deleteFile', incidentsController.deleteFile)
 router.get('/deleteComment', incidentsController.deleteComment)

 router.get('/KPI', incidentsController.kpi)
 router.get('/OverallWidget', incidentsController.overallWidget)
 router.get('/Last5Incidents', incidentsController.last5Incidents)
 router.get('/Oldest5UnresolvedIncidents', incidentsController.oldest5UnresolvedIncidents)
 router.get('/MostAssignedToUsersIncidents', incidentsController.mostAssignedToUsersIncidents)


module.exports = router;