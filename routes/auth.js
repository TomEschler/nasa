const express = require("express")
const User = require("../models/user");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");

//post a new user to user collection (signing up)
authRouter.post("/signup", (req, res, next) => {
    // try to find a user with the provided username. (If it already exists, we want to tell them
    // that the username is already taken.)
    User.findOne({username: req.body.username}, (err, existingUser) => {
        if (err) {
            res.status(500);
            return next(err);
        }
        // If the db doesn't return "null" it means there's already a user with that username.  Send the error object to the global error handler on your server file.
        if (existingUser !== null) {
            res.status(400);
            return next(new Error("That username already exists!"));
        }
        // If the function reaches this point and hasn't returned already, we're safe
        // to create the new user in the database.
        const newUser = new User(req.body);
        newUser.save((err, user) => {
            if (err) {
                res.status(500);
                return next(err);
            }
            
            // If the user signs up, we might as well give them a token right now
            // So they don't then immediately have to log in as well
            const token = jwt.sign(user.withoutPassword(), process.env.SECRET);
            return res.status(201).send({success: true, user: user.withoutPassword(), token});
        });
    });
});

authRouter.post("/login", (req, res) => {
    User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) {
            return res.status(403).send({success: false, err: "Username or password are incorrect"})
        }
        user.checkPassword(req.body.password, (err, match) => {
            if (err) return res.status(500).send(err);
            if (!match) return res.status(401).send({ success: false, message: "Username or password are incorrect" });
            const token = jwt.sign(user.withoutPassword(), process.env.SECRET);
            return res.send({ token: token, user: user.withoutPassword(), success: true })
        });
    });
})

module.exports = authRouter;