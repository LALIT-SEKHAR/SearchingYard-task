require('dotenv').config();
const User = require("../models/Auth");
const { createjwt, verifyjwt } = require("./Helper/auth");

exports.Signup = (req, res) => {
    if(!req.body.name || !req.body.email || !req.body.password){
        return res.json({
            error: true,
            status: "invalid input parse"
        })
    }
    const userdata = new User(req.body);
    userdata.save((err, user) => {
        if (err || !user) {
            if (err.keyPattern.email){
                return res.json({
                    error: err.name,
                    status: "Email alrady exist"
                })
            }
            return res.json({
                error: err.name,
                status: "unable to store user in DB"
            })
        }
        const userinfo = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }
        res.json({
            status: "User Saved Successfully.",
            user: userinfo
        })
    })
}

exports.Signin = async (req, res) => {
    if(!req.body.email || !req.body.password){
        return res.json({
            error: true,
            status: "invalid input parse"
        })
    }
    const { email, password } = req.body;
    // Gating user from DB using User's email id
    try {
        const Userdata = await User.findOne({email}, (err, user) => {
            if (err || !user) {
                res.json({
                    error: err ? err.name : 'No User',
                    status: "unable to find user in DB"
                })
            }
            return user;
        })
        if (Userdata !== null) {
            // Checking User password
            const CheckPassword = await Userdata.authenticate(password);
            // if the password is worang
            if (!CheckPassword) {
                return res.json({
                    error: 'Worang Password',
                    status: "User Password Does't Match",
                })
            }
            // if the password matches with the user password
            const userinfo = {
                id: Userdata._id,
                email: Userdata.email,
                name: Userdata.name,
            }
            const AccessToken = createjwt(userinfo, process.env.ACCESS_TOK_SECRET, '20s')
            const RefreshToken = createjwt(userinfo, process.env.REFRESH_TOK_SECRET, '7d')
            User.findById(Userdata._id, (err, user) => {
                if (err || !user) {
                    return res.json({
                        error: 'Error while updating music info'
                    })
                }
                user.refToken.push(RefreshToken)
                const updatedUser = new User(user)
                updatedUser.save((err, user) => {
                    if (err || !user) {
                        console.log(err);
                        return res.json({
                            error: "Unable to Updating the refToken!"
                        })
                    }
                    res.json({
                        status: "User Signin Successfully",
                        AccessToken,
                        RefreshToken
                    })
                })
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Unexcepted Error !',
            status: "error occer while signin",
        })
    }
}

exports.Token = async (req, res) => {
    const { token } = req.body;
    try {
        const tokenData = await verifyjwt(token, process.env.REFRESH_TOK_SECRET)
        if (!tokenData.data) {
            return res.json({
                error: true,
                status: "invalid token",
            })
        }
        const userId = tokenData.data.id
        User.findById(userId, (err, user) => {
            if (err || !user) {
                return res.json({
                    error: 'Error while creating Refresh Token'
                })
            }
            if (!user.refToken.includes(token)) return res.json({error: 'Error while creating Refresh Token'})
            const AccessToken = createjwt(tokenData.data, process.env.ACCESS_TOK_SECRET, '20s')
            res.json({
                status: "User Access token created Successfully",
                AccessToken,
            })
        })
    } catch (error) {
        return res.json({
            error: 'Unexcepted Error !',
            status: "error occer while signin",
        })
    }
}

exports.Signout = (req, res) => {
    const RefToken = verifyjwt(req.body.token, process.env.REFRESH_TOK_SECRET)
    User.findById(RefToken.data.id, (err, user) => {
        if (err || !user) {
            return res.json({
                error: 'Error while logout'
            })
        }
        const newrefToken = user.refToken.filter(token => token !== req.body.token)
        user.refToken = newrefToken
        const updatedUser = new User(user)
        updatedUser.save((err, user) => {
            if (err || !user) {
                console.log(err);
                return res.json({
                    error: "Unable to logout"
                })
            }
            res.json({
                status: "User Logout Successfully."
            })
        })
    })
}