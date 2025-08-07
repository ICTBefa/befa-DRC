const auditTrail = require('./auditTrail')

const middleware = {

    checkSession : (req, res, next)=>{
        //console.log("REQ LOGGING")
        //console.log(req.session.user)
        if(req.session.user){
            next()
        }else{
            res.redirect('/')
        }
    },

    checkSessionLevel : (pathLevelAkses) => {
        return (req, res, next) => {
            try {
                //if user level access is not enough to open said path, redirect to login
                if(req.session.user.levelAkses <= pathLevelAkses) {
                    next()
                }else{
                    console.log('User Access Level is not enough. user id ' + req.session.user.id);
                    res.redirect('/');
                }
            } catch (e) {
                //console.log(e);
                res.redirect('/');
            }
        }
    },
    
    protectedAPI : (req, res, next)=>{
        var token = req.headers['x-access-token'];
        const jwt = require('jsonwebtoken');
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token. Or token expired',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    //succcess - get the user data who is logging in
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
                    req.api_session = api_session;
                    req.token = token;
                    next()
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

    protectedAdminAPI : (req, res, next)=>{
        var token = req.headers['x-access-token'];
        const jwt = require('jsonwebtoken');
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token. Or token expired',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    //succcess - get the user data who is logging in
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
                    req.api_session = api_session;
                    req.token = token;

                    if (req.api_session.int_ext == "1" && req.api_session.apps_roles_id > 3) {
                        auditTrail.audit(req,"Failed. Invalid INT user Access Role");
                        //not allowed
                        res.json({
                            status: '300',
                            message: 'Invalid user Access Role',
                            hideNavbar : false
                        });
                    } else if (req.api_session.int_ext == "2" ){
                        //external not allowed
                        auditTrail.audit(req,"Failed. Invalid EXT user Access Role");
                        //not allowed
                        res.json({
                            status: '300',
                            message: 'Invalid user Access Role',
                            hideNavbar : false
                        });
                    } else {
                        next()
                    }
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
    
    protectedSuperAdminAPI : (req, res, next)=>{
        var token = req.headers['x-access-token'];
        const jwt = require('jsonwebtoken');
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token. Or token expired',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    //succcess - get the user data who is logging in
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
                    req.api_session = api_session;
                    req.token = token;

                    if (req.api_session.int_ext == "1" && req.api_session.apps_roles_id > 2) {
                        auditTrail.audit(req,"Failed. Invalid INT user Access Role");
                        //not allowed
                        res.json({
                            status: '300',
                            message: 'Invalid user Access Role',
                            hideNavbar : false
                        });
                    } else if (req.api_session.int_ext == "2" ){
                        //external not allowed
                        auditTrail.audit(req,"Failed. Invalid EXT user Access Role");
                        //not allowed
                        res.json({
                            status: '300',
                            message: 'Invalid user Access Role',
                            hideNavbar : false
                        });
                    } else {
                        next()
                    }
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

    protectedExtAndAdminAPI : (req, res, next)=>{
        var token = req.headers['x-access-token'];
        const jwt = require('jsonwebtoken');
        if ( typeof token !== 'undefined' && token ) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                    res.json({
                        status: '500',
                        message: 'Failed to authenticate token. Or token expired',
                        data : null,
                        hideNavbar : false
                    });
                } else {
                    //succcess - get the user data who is logging in
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
                    req.api_session = api_session;
                    req.token = token;

                    if (req.api_session.int_ext == "1" && req.api_session.apps_roles_id > 2) {
                        auditTrail.audit(req,"Failed. Invalid user Access Role");
                        //not allowed
                        res.json({
                            status: '300',
                            message: 'Invalid user Access Role',
                            hideNavbar : false
                        });
                    } else {
                        next()
                    }
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

    sendAPI : (req, res, next)=>{
        //console.log(req);
        next()
    },
}


module.exports = middleware