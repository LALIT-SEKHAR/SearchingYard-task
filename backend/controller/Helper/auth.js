require('dotenv').config()
const jwt = require('jsonwebtoken');

// creating JWT
exports.createjwt = (data, secret, time) => {
    try {
        return jwt.sign({data}, secret, { expiresIn: time });
    } catch (error) {
        return res.json({
            error: 'JWT Error',
            status: "Not able to Create JWT"
        })
    }
}

// verify a token JWT
exports.verifyjwt = (token, secret) => {
    try {
        return jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return err
            }
            return decoded;
        });
    } catch (error) {
        return error
    }
}

exports.IsAuthorised = async (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.json({
            error: "Not Signin!"
        })
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    if (token === null) {
        return res.json({
            error: "Not Signin!"
        })
    }
    try {
        // const payload = jwt.verify(token, process.env.SECRET);
        const tokenData = await this.verifyjwt(token, process.env.ACCESS_TOK_SECRET)
        if (!tokenData.data) {
            return res.status(401).json({
                error: "Not Authorised"
            })
        }
        next();
    } catch (error) {
        return res.json({
            error: error.message
        })
    }
    
}