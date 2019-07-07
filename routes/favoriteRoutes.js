const express = require('express')
const favoriteRouter = express.Router()
const Favorite = require('../models/Favorite')


favoriteRouter.route('/')

    .get((req, res, next)=> {
        Favorite.find({user: req.user._id}, (err, favorites) => {
            if (err) {
                res.status(500);
                return next(err);
            };
            return res.status(200).send(favorites);
        })
    })


    .post((req, res, next) => {
        const newFav = new Favorite(req.body)

        newFav.user = req.user._id

        newFav.save((err, fav)=> {
            if (err) {
                res.status(500);
                return next(err);
            };
            return res.status(201).send(fav)
        })
    })


favoriteRouter.route('/:id')


    .delete((req, res) => {
        Favorite.findByIdAndDelete(req.params.id, (err) => {
            if(err) return res.status(500).send(err)
            return res.status(200).send('Succesfully deleted item')
        })
    })



module.exports = favoriteRouter