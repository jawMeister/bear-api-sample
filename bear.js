import express from 'express';
import mongoose from 'mongoose';
import Bear from '../models/bearModel';

mongoose.connect('mongodb://localhost/test/geoff');

let router = express.Router();
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'db connection error:'));

db.once('open', function() {
  console.log('connected to db successfully');
});

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  // just logging the time stamp
  console.log('Time: ', Date.now());
  next();
});

// handle get, post for /bear
// TODO: put all of this get/post logic into a separate controller.js to aid unit testing + clean-up
router.route('/bear')
    .get(function (req, res) {
        // start with null query in order to validate/sanitize query parms
        let query = {};

        // sets a type filter on the query - can put additional checks here
        if(req.query.type) {
            query.type = req.query.type;
        }

        Bear.find(query, function(err, bears) {
            if(err) {
                res.status(500).send(err);
            } else {

                // this is HATEOAS - add reference links to each object - self-documenting API - cool
                // TODO: WTF with the loop every time though? Can this get unwieldy when there are a lot of elements?
                let returnBears = new Array(bears.length);

                bears.forEach(function(element, index) {
                    var newBear = element.toJSON();
                    newBear.links = {};
                    newBear.links.self = 'http://' + req.headers.host + '/api/bear/' + newBear._id;

                    returnBears[index] = newBear;
                });

                res.json(returnBears);


                //res.json(bears);
            }
        });
    })

    // create a new bear
    .post(function (req, res) {
        let bear = new Bear(req.body);

        bear.save();
        // status 201 is "created"
        res.status(201).send(bear);

    });


// middleware... instead of findById in each method, do it once here and add to the request body, then 'next'
router.use('/bear/:bear_id', function(req, res, next) {
    let id = req.params.bear_id;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        Bear.findById(req.params.bear_id, function(err, bear) {
            if(err) {
                res.status(500).send(err);
            } else if (bear) {
                console.log('found a bear!');
                console.log(bear);
                req.bear = bear;
                next();
            } else {
                res.status(404).send('no matching bear found for ' + req.params.bear_id);
            }
        });
    } else {
        console.log(req.params.bear_id);
        console.log(req.bear);
        res.status(500).send(req.params.bear_id + ' is an invalid bear id');
    }
});

// handle get/put for /bear/:bear_id
// TODO: put all of this route logic into a separate controller.js - needed for unit testing as well
router.route('/bear/:bear_id')
    .get(function (req, res) {

        // HATEOS - return links within the response to help caller navigate and find other stuff
        var newBear = req.bear.toJSON();
        newBear.links = {};
        newBear.links.FilterByBearType = 'http://' + req.headers.host + '/api/bear/?type=' + newBear.type;

        res.json(newBear);
    })
    .put(function (req, res) {
        req.bear.name = req.body.name;
        req.bear.type = req.body.type;
        req.bear.weight = req.body.weight;

        // async save and respond on callback
        req.bear.save(function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(req.bear);
            }
        });

    })
    .patch(function (req, res) {
        if (req.body._id) {
            // never want to update the _id
            delete req.body._id;
        }

        console.log('req.bear before then after loop');
        console.log(req.bear);

        for (var p in req.body) {
            req.bear[p] = req.body[p];
        }

        console.log(req.bear);

        // async save and respond on callback
        req.bear.save(function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(req.bear);
            }
        });
    })
    .delete(function(req, res) {
        req.bear.remove(function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(204).send('removed');
            }
        });
    });



// define the about route
router.get('/about', function (req, res) {
  res.send('about bears');
});

export default router;
