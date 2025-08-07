const mainModel = require('./mainModel')
const jwt = require('jsonwebtoken');
const auditTrail = require('./auditTrail');
const main = {

    login: (req, res) => {
        mainModel.checkDbConn((connStatus) => {
            if (connStatus.local.error) {
                res.render('pages/login', {
                    title: 'Login',
                    isLogin: true,
                    dbStatus: connStatus,
                    hideNavbar : true
                });
            } else {
                res.render('pages/login', {
                    title: 'Login',
                    isLogin: true,
                    dbStatus: connStatus,
                    hideNavbar : true
                });
            }
        });
    },

    loginValidation : (req, res)=>{

        var data = {
            email : req.body.email,
            password : req.body.password
        }
        
        mainModel.login(data, (response, code)=>{

            if(code == 1){
                const ARR_HIDE_MENU_ROLE_IDS = [4, 5, 6, 7, 8, 9]     /* refer to table: role */
                const isShowMenu = !ARR_HIDE_MENU_ROLE_IDS.includes(response.role_id);

                req.session.user = {
                    id : response.id,
                    name : response.username,
                    fullname : response.fullname,
                    roleId: response.level_akses,
                    roleName: response.level_akses_name,
                    psikotes: response.psikotes,
                    levelAkses: response.level_akses_id,
                    isShowMenu: isShowMenu
                }

                switch (response.level_akses) {
                    //case 1: res.redirect('/somewhere'); break; //to redirect based on role id
                    default: res.redirect('/dashboard');
                }

            }else{
                let message = {
                    status : false,
                    data : null,
                    message : "username atau password tidak valid"
                }

                res.render('pages/login',{
                    title : 'Login',
                    isLogin : true,
                    data : message,
                    hideNavbar : true
                })
            }
        })

        
    },

    logout: (req, res) => {
        delete req.session.user;
        res.redirect('/');
    },

    apiLogout: (req, res) => {
        //console.log("logout api called");
        //console.log(req.session.user);
        mainModel.logout(req.session.user.id,(code) => {
            delete req.session.user;
            if (code == "1") {
                //console.log("logout api called code 1");
                res.json({
                    title: 'Logout Success',
                    status: '200',
                });
            } else {
                //console.log("logout api called code 0");
                res.json({
                    title: 'Logout Failed',
                    status: '300',
                });
            }
        })
    },

    apiLogin: (req, res) => {
        mainModel.checkDbConn((connStatus) => {
            if (connStatus.local.error) {
                res.json({
                    title: 'Login',
                    dbStatus: connStatus,
                    hideNavbar : true,
                });
            } else {
                res.json({
                    title: 'Login',
                    dbStatus: connStatus,
                    hideNavbar : true
                });
            }
        });
    },

    
    apiLoginValidation : (req, res)=>{

        var data = {
            email : req.body.email,
            password : req.body.password,
            remember : req.body.remember
        }
        
        mainModel.login(data, (response, code)=>{
            //console.log('response:', response);
            var expiredAt;
            if (req.body.remember) expiredAt= 21600; // 6 hours
            else expiredAt= 108000; // 30 days
            if(code == 1){
                var tokenJWT = jwt.sign( { 
                        id: response.id,
                        name : response.username,
                        fullname : response.fullname,
                        roleId: response.level_akses,
                        roleName: response.level_akses_name
                    }, 
                    process.env.SECRET_KEY, {
                        expiresIn: expiredAt // expired 6 hours or 30 days
                });

                let dataRes = {
                    id : response.id,
                    name : response.username,
                    fullname : response.fullname,
                    roleId: response.level_akses,
                    roleName: response.level_akses_name,
                    token: tokenJWT
                }

                res.json({
                    status: '200',
                    message: 'Success Login',
                    data : dataRes,
                    hideNavbar : false
                });

            } else if (code == 2) {
                res.json({
                    status: '303',
                    message: 'Error creating session',
                    data : null,
                    hideNavbar : false
                });
            } else {
                res.json({
                    status: '300',
                    message: 'Username or password error',
                    data : null,
                    hideNavbar : false
                });
            }
        })
    },

    apiGetSession : (req, res)=>{
        //console.log('api get session entered logging');
        var token = req.headers['x-access-token'];
        //console.log("req.headers = " + req.headers) 
        //console.log(req.headers) 
        //console.log("token logging = "+token);
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token or token expired.',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    let api_session = {
                        user_id: decoded.user_id,
                        username : decoded.username,
                        location_id: decoded.location_id,
                        location_name : decoded.location_name,
                        fullname : decoded.fullname,
                        apps_roles_id: decoded.apps_roles_id,
                        role_name: decoded.role_name,
                        department : decoded.department
                    }
                    req.api_session = api_session;
                    //auditTrail.audit(req,"Success Login or get previous login session");
                    res.json({
                        status: '200',
                        message: 'Success Login',
                        data : api_session,
                        hideNavbar : false
                    });
                }
            });
        } else {
            res.json({
                status: '401',
                message: 'No token provided.',
                data : null,
                hideNavbar : false
            });
        }
    },

    apiGetSessionHD : (req, res)=>{
        //console.log('api get session entered logging');
        var token = req.headers['x-access-token'];
        //console.log("req.headers = " + req.headers) 
        //console.log(req.headers) 
        //console.log("token logging = "+token);
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token or token expired.',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    let api_session = {
                        int_ext: decoded.int_ext,
                        user_id: decoded.user_id,
                        username : decoded.username,
                        location_id: decoded.location_id,
                        location_name : decoded.location_name,
                        fullname : decoded.fullname,
                        apps_roles_id: decoded.apps_roles_id,
                        role_name: decoded.role_name,
                        department: decoded.department,
                        tenant_user_id_ext: decoded.tenant_user_id_ext,
                        tenant_id_ext : decoded.tenant_id_ext,
                        display_name_ext : decoded.display_name_ext,
                        position_ext : decoded.position_ext,
                    }
                    //console.log("api session HD");
                    //console.log(api_session);
                    req.api_session = api_session;
                    //auditTrail.audit(req,"Success Login or get previous login session");
                    res.json({
                        status: '200',
                        message: 'Success Login',
                        data : api_session,
                        hideNavbar : false
                    });
                }
            });
        } else {
            res.json({
                status: '401',
                message: 'No token provided.',
                data : null,
                hideNavbar : false
            });
        }
    },

    apiformExampleWithID : (req, res)=>{
        //console.log('api form example with id called');
        //console.log("params id = "+req.params.id);
        //console.log(req.params.id);
        mainModel.formExampleID(req.params.id,(response, code) => {
            try {
                var jsonData = response.doc_content;
                //console.log(jsonData)
                res.json({
                    status: '200',
                    message: 'sending json data.',
                    data : jsonData,
                    hideNavbar : false
                });
            } catch {
                var jsonData2 = '{"email":"FAILED QUERY OI","pass":"FORM PERMINTAAN ICT","check":true}';
                //console.log(jsonData)
                res.json({
                    status: '200',
                    message: 'sending json data.',
                    data : jsonData2,
                    hideNavbar : false
                });
            }
           
        })
    },

    apiformExample : (req, res)=>{
        //console.log('api form example called');
 
        mainModel.formExample((response, code) => {
            //console.log('api get session entered logging fexam');
            var jsonData = response.doc_content;
            //console.log(jsonData)
            res.json({
                status: '200',
                message: 'sending json data.',
                data : jsonData,
                hideNavbar : false
            });
        })
    },

    random123 : (req, res)=>{
        //console.log('random 123 called'); 
 
        var jsonData =  Math.floor(Math.random() * (3 - 1 + 1)) + 1;
       // console.log(jsonData)
        res.json({
            status: '200',
            message: 'sending json data.',
            data : jsonData,
            hideNavbar : false
        });

    },

    showDocumentList : (req, res)=>{
        //console.log('api show document list called');
        mainModel.docList(req.api_session, (response, code) => {
            if (response){
                //console.log('api get session entered logging fexam');
                var jsonData = response;
                //console.log(jsonData)
                res.json({
                    status: '200',
                    message: 'sending json data.',
                    data : jsonData,
                    hideNavbar : false
                });
            } else {
                res.json({
                    status: '300',
                    message: 'Error or user not allowed',
                    data : null,
                    hideNavbar : false
                });
            }
            
        })
    },
    
    apiPortalLogin : (req, res)=>{
        //console.log('api portal login logging');
        var token = req.headers['x-access-token'];
        //console.log("req.headers = " + req.headers) 
        //console.log(req.headers) 
        if ( typeof token !== 'undefined' && token ) {
            //console.log("Verifying token apiPortalLogin");
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    //console.log("Error Verify, token failed");
                    res.json({
                        status: '500',
                        message: 'Session Expired. Harap Logout dan Login ulang',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    //console.log("Verify Success, token decoded - User ID " + decoded.user_id);
                    auditTrail.auditManual(decoded.user_id,'Success Login User '+ decoded.username,'');
                    let dataRes = {
                        user_id: decoded.user_id,
                        username : decoded.username,
                        location_id: decoded.location_id,
                        location_name : decoded.location_name,
                        fullname : decoded.fullname,
                        apps_roles_id: decoded.apps_roles_id,
                        role_name: decoded.role_name,
                        department : decoded.department
                    }
                    mainModel.autoGenerateInternalUser(decoded.user_id, decoded.fullname, (response, code) => {
                        if (code == 1 || code == 2) {
                            res.json({
                                status: '200',
                                message: 'Success Login',
                                redirectPath: process.env.FRONTEND_PORTAL_LOGIN_DESTINATION,
                                data : dataRes,
                                hideNavbar : false
                            });
                        } else {
                            console.log("Error generating new user");
                            res.json({
                                status: '200',
                                message: 'Success Login With Errors',
                                redirectPath: process.env.FRONTEND_PORTAL_LOGIN_DESTINATION,
                                data : dataRes,
                                hideNavbar : false
                            });
                        }
                    })

                    
                }
            });
        } else {
            //console.log("Error Verify, no token provided");
            res.json({
                status: '401',
                message: 'Error Sistem. Harap Logout and Login ulang',
                data : null,
                hideNavbar : false
            });
        }
    },

    apiHelpdeskLogin : (req, res)=>{
        //console.log("apiHelpdeskLogin is called");
        var data = {
            email : req.body.email,
            password : req.body.password
        }
        
        mainModel.loginHelpdesk(data, (response, code)=>{
            if (code == 2) {
                expiredAt= 21600; // 6 hours

                var tokenJWT = jwt.sign( { 
                    int_ext: "2",
                    user_id: null,
                    username : null,
                    location_id: null,
                    location_name : null,
                    fullname : null,
                    apps_roles_id: null,
                    role_name: null,
                    department: null,
                    tenant_user_id_ext: response.id,
                    tenant_id_ext : response.tenant_id,
                    display_name_ext : response.display_name,
                    position_ext : response.position,
                    
                }, 
                    process.env.SECRET_KEY, {
                        expiresIn: expiredAt // expired 6 hours 
                });

                let dataRes = {
                    int_ext: "2",
                    user_id: null,
                    username : null,
                    location_id: null,
                    location_name : null,
                    fullname : null,
                    apps_roles_id: null,
                    role_name: null,
                    department: null,
                    tenant_user_id_ext: response.id,
                    tenant_id_ext : response.tenant_id,
                    display_name_ext : response.display_name,
                    position_ext : response.position,
                    token: tokenJWT
                }
                //console.log("TOKEN JWT");
                //console.log(tokenJWT);

                var dataRes2 = {data : dataRes};

                res.json({
                    status: '200',
                    message: 'Login External Success - Redirecting',
                    data : dataRes2,
                    hideNavbar : false
                });

            } else if (code == 3) {
                res.json({
                    status: '300',
                    message: 'Please Input valid email and password',
                    data : response,
                    hideNavbar : false
                });

            } else if (code == 1) {
                mainModel.autoGenerateInternalUser(response.data.user_id, response.data.fullname, (responseSth, code) => {
                    res.json({
                        status: '200',
                        message: 'Login Internal Success - Redirecting',
                        data : response,
                        hideNavbar : false
                    });
                })
            } else {
                res.json({
                    status: '401',
                    message: 'Error Sistem. Harap Logout and Login ulang',
                    data : null,
                    hideNavbar : false
                });
            }
        })
    },

    getAuditList : (req, res)=>{
        auditTrail.getAuditList(req.token,(response, code) => {
            auditTrail.audit(req,"Success");
            if (code == 1 ) {
                res.json({
                    status: '200',
                    message: 'sending json data.',
                    data : response,
                    hideNavbar : false
                });
            } else {
                auditTrail.audit(req,"Error or user not allowed");
                res.json({
                    status: '300',
                    message: 'Error or user not allowed',
                    data : null,
                    hideNavbar : false
                });
            }
            
        })
    },

    getAuditDocList : (req, res)=>{
        auditTrail.getAuditDocList(req.token,(response, code) => {
            auditTrail.audit(req,"Success");
            if (code == 1 ) {
                res.json({
                    status: '200',
                    message: 'sending json data.',
                    data : response,
                    hideNavbar : false
                });
            } else {
                auditTrail.audit(req,"Error or user not allowed");
                res.json({
                    status: '300',
                    message: 'Error or user not allowed',
                    data : null,
                    hideNavbar : false
                });
            }
            
        })
    },
}

module.exports = main