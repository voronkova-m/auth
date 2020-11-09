let express = require('express');
let bodyParser = require('body-parser');
let config = require('./config/index');
let passport = require('passport');
let session = require('express-session');
const keys = require('./libs/jsonwebtoken');
let app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.use(require('morgan')('dev'))

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use(session({ secret: keys.jwt, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

require('./routes')(app);

app.listen(config.get('port'));
