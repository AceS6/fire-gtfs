var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.use(function(req, res, next) {
        if(req.query.schema != null){
                next();
        }
        else{
                return res.status(403).send({
                        success: false,
                        message: 'Please provide a schema.'
                });
        }
});

router.get('/', function(req, res) {
        res.status(200).json({ success: true, message: 'Welcome to the trip section of the pushtime api'});
});

router.get('/list', function(req, res) {
        models.sequelize.query("SELECT * from "+req.query.schema+".gtfs_routes",
        { replacements: {}, type: models.sequelize.QueryTypes.SELECT})
        .then(function(routes) {
                res.status(200).json({ success: true, message: 'Routes', routes: routes});
        });
});

router.get('/count', function(req, res) {
        models.sequelize.query("SELECT COUNT(*) from "+req.query.schema+".gtfs_routes",
        { replacements: {}, type: models.sequelize.QueryTypes.SELECT})
        .then(function(count) {
                res.status(200).json({ success: true, message: 'Counted available routes', count: count});
        })
});

module.exports = router;
