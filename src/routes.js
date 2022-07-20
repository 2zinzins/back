const path = require('path');

module.exports = function(router, services) {


    router.get('/api/position/get', function(req, res) {
        res.json(services.positionManager.positionData);
    });

    router.post('/api/position/register', function(req, res) {
        if(services.tokenManager.isTokenValid(req.body.registerToken)) {
            services.tokenManager.invalidateToken(req.body.registerToken);
            services.positionManager.registerPosition(req.body.position);
            res.status(200).send('Position actualisée');
        } else {
            res.status(403).send('Token invalide');
        }
    });

    router.get('/register/:api_key', function(req, res) {
        if(process.env.API_KEY === req.params.api_key) {
            res.render('position/register',  {
                registerToken: services.tokenManager.generateNewToken()
            });
        } else {
            res.status(403).send('Clé d\'api invalide')
        }
    })

    router.get('/*', function(req, res) {
        res.sendStatus(404);
    });
};