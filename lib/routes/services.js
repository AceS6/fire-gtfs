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
        if(req.query.route_id != null){
                models.sequelize.query("SELECT route_id, direction_id, trip_headsign from "+req.query.schema+".gtfs_trips as nested where route_id=:route_id group by route_id, direction_id, trip_headsign",
                { replacements: {route_id: req.query.route_id}, type: models.sequelize.QueryTypes.SELECT})
                .then(function(services) {
                        res.status(200).json({ success: true, message: 'Services', services: services});
                });
        }
        else{
                return res.status(403).send({
                        success: false,
                        message: 'Please provide a route id.'
                });
        }
        
});


router.get('/get', function(req, res) {
        if(req.query.route_id != null && req.query.direction_id != null){
                models.sequelize.query("SELECT DISTINCT(service_id) from "+req.query.schema+".gtfs_trips where route_id=:route_id and direction_id=:direction_id",
                { replacements: {route_id: req.query.route_id, direction_id: req.query.direction_id}, type: models.sequelize.QueryTypes.SELECT})
                .then(function(services) {
                        res.status(200).json({ success: true, message: 'Services', services: services});
                });
        }
        else{
                return res.status(403).send({
                        success: false,
                        message: 'Please provide a route id and a direction_id.'
                });
        }

});


router.get('/count', function(req, res) {
        models.sequelize.query("SELECT COUNT(*) from "+req.query.schema+".gtfs_trips",
        { replacements: {}, type: models.sequelize.QueryTypes.SELECT})
        .then(function(count) {
                res.status(200).json({ success: true, message: 'Counted available trips', count: count});
        })
});

module.exports = router;
