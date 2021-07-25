const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    encry_password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    refToken:[]
},{timestamps: true});

userSchema.virtual("password")
.set(function(password) {
    this._password = password;
    this.salt = uuidv4();
    this.encry_password = this.securePassword(password);
})
.get(function() {
    return this._password
})

userSchema.virtual("firstname")
.get(function() {
    return this.name.split(' ')[0];
})

userSchema.methods = {

    authenticate: function(plainpassword) {
        return this.securePassword(plainpassword) === this.encry_password;
    },

    securePassword: function(plainpassword) {
        if (!plainpassword) return "" ;
        try {
            return crypto.createHmac('sha256', this.salt)
                    .update(plainpassword)
                    .digest('hex');
            
        } catch (err) {
            return "";
        }
    }
};


module.exports = mongoose.model("User", userSchema)