const User = require('../models/user');

exports.createOrUpdateUser = async (req, res) => {
    const { name, email, picture } = req.user;
    const user = await User.findOneAndUpdate({email}, 
        {
            name : email.split("@")[0],
            picture
        }, 
        {
            new:true
        }
    );
    // {new:true} makes sure that we get back the recently updated information
    // and not the old one
    // so, user has the updated information

    if(user){
        // if user exists and we were able to update
        console.log('User updated from controllers/auth.js - ', user);
        res.json(user);
    }
    else{
        // if we did not get the searched for user the we create a new one and save it
        const newUser = await new User({
            email,
            name : email.split("@")[0],
            picture
        }).save();
        console.log('User created and saved from controllers/auth.js - ', newUser);
        res.json(newUser);
    }
}

exports.currentUser = async (req, res) => {
    // here we can acces the email (user.email) feild because we are assigning the user to the
    // req object when we do the authCheck in auth middleware.
    User.findOne({ email : req.user.email }).exec((err, user) => {
        if(err) throw new Error(err);
        res.json(user);
    });
}