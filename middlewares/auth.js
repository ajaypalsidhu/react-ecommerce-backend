const admin = require('../firebase'); 
// to get firebaseAdmin
const User = require('../models/user'); 

exports.authCheck = async (req, res, next) => {
    //console.log(req.headers);
    try{
        //console.log('Token is ', req.headers.authtoken);
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
        req.user = firebaseUser;
        next();
    } catch(err){
        console.log(err);
        //console.log('Error from middlewares/auth.js....', err);
        res.status(401).json({            
            err : 'Invalid or expired token. authCheck. Message from middlewares/auth.js.'
        })
    }
} 

exports.adminCheck = async (req, res, next) => {
    const { email } = req.user;

    const adminUser = await User.findOne({ email }).exec();

    if (adminUser.role !== 'admin'){
        res.status(403).json({
            err : 'User not of admin type. Acess denied from middleware/auth'
        })
    }
    else{
        next();
    }
}
