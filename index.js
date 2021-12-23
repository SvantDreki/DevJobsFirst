const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });

const app = express();

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());

//Habilitar handlebars como view
app.engine('handlebars', 
    exphbs({
        defaultLayout: 'layouts',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false, 
    store: new MongoStore({ mongooseConnection: mongoose.connection})
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//alertas y flash messages
app.use(flash());

//crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

app.listen(process.env.PUERTO);