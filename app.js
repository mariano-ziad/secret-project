require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app =  express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/userDB');
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String
});
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
const User = mongoose.model('User', userSchema);

app.get("/", (req, res)=>{
    res.render("home")
});
app.get("/login", (req, res)=>{
    res.render("login")
});
app.get("/register", (req, res)=>{
    res.render("register")
});

app.post("/register",(req, res)=>{
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
    .then((result) => {
        res.render("secrets");
    }).catch((err) => {
        if (err.code === 11000) {
            res.send("Duplicate email error");
        } else {
            res.send(err);
        }
    });
});
app.post("/login", (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username})
    .then((foundEmail) => {
        if (foundEmail) {
            if (foundEmail.password === password) {
                res.render("secrets");
            } else {
                res.send("wrong password")
            }
        } else {
            res.send("there's no such user")
        }
    }).catch((err) => {
        console.log(err);
    });
})






app.listen(3000, ()=>{console.log("Server started on port 3000")});