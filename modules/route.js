const express = require('express');
const route = express.Router();
const main = require('./main.js');
const user = require('./user/userController.js');
const middleware = require('./middleware');


// start main function
route.get('/', main.login);
route.post('/loginValidation', main.loginValidation);
route.get('/logout', middleware.checkSession, main.logout);
// end main function

// start user module
route.get('/userList', middleware.checkSessionLevel(1), user.userList);
route.get('/userCreate', middleware.checkSessionLevel(1), user.userCreate);
route.post('/CreateNewUser', middleware.checkSessionLevel(1), user.userCreateNew);
route.get('/userEdit/:id', middleware.checkSessionLevel(1), user.userEdit);
route.post('/EditUser', middleware.checkSessionLevel(1), user.userEditExisting);
route.get('/userDelete/:id', middleware.checkSessionLevel(1), user.userDelete);
// end user module

//admin config
route.get('/api/auditList', middleware.protectedSuperAdminAPI, main.getAuditList);
//end admin config

//check the middleware and change and determine data from there
//checksession try to add variables from here, get user akses elvel too from login

module.exports = route