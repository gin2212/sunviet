const express = require('express');
const approvalProcessController = require('../controllers/approvalProcessController');
const router = express.Router();
const middlewares = require('./middlewares');

router.post('/approval-processes/create', middlewares.authorize, approvalProcessController.createApprovalProcess);
router.post('/approval-processes/:processId/steps/create', middlewares.authorize, approvalProcessController.createApprovalStep);
router.get('/approval-processes/getAll', middlewares.authorize, approvalProcessController.getAllApprovalProcesses);
router.get('/approval-processes/getById/:id', middlewares.authorize, approvalProcessController.getApprovalProcessById);
router.put('/approval-processes/update/:id', middlewares.authorize, approvalProcessController.updateApprovalProcess);
router.delete('/approval-processes/delete/:id', middlewares.authorize, approvalProcessController.deleteApprovalProcess);
router.get('/approval-processes/:processId/steps', middlewares.authorize, approvalProcessController.getApprovalProcessSteps);



module.exports = router;