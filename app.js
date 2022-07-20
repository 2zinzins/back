require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const router = express.Router()
const positionController = require('./src/managers/position.manager')();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';
//add the router folders

const services = {
    tokenManager: require('./src/managers/token.manager')(),
    positionManager: require('./src/managers/position.manager')()
}


app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/public')); 
app.use('/', router);       // add the router

//routes and ioController
require('./src/routes')(router, services);

app.listen(PORT, HOST, () => console.log(`Server is running on port ${PORT}`));