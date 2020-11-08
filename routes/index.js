const request = require('request');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const passport = require('passport');
let User = require('../models/userSchema').User;
const keys = require('../libs/jsonwebtoken');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    
    app.get('/check-user', function (req, res) {
        let userId = req.body.userId;
        console.log(userId);
        let userOut = {"_id": '', "login": ''};
        User.findById(userId, function (err, user) {
            if (user == undefined) {
                res.send(undefined);
            } else {
                userOut._id = user._id;
                userOut.login = user.login;
                res.send(userOut);
            }
        });
        //let user = User.findById(userId).select('login id');
    })

    app.get('/users', passport.authenticate('jwt', {session: false}), function (req, res) {
    //app.get('/users', passport.authenticate('jwt', {session: false}), function (req, res) {
        User.find({}, function (err, users) {
            if (err){
                res.render('error', {message: err.message});
                return;
            }
            res.render('users', {users: users});  // для отладки
            //res.send(req.user.login);  // для отладки
        });
    });

    app.get('/register', function (req, res) {
        res.render('register');
    });

    app.post('/register', async function (req, res) {
        let login = req.body.login;
        let candidate = await User.findOne({login: login});

        if (candidate){
            // если такой пользователь есть
            res.status(409).json({
               message: 'Такой login уже занят. Попробуйте другой'
            });
        } else {
            let password = req.body.password;
            let salt = bcrypt.genSaltSync(10);
            let newUser = new User({login: login, password: bcrypt.hashSync(password, salt)});
            try{
                await newUser.save();
                res.redirect("http://127.0.0.1:5000/users")
            } catch(err){
                // обработка ошибки
                res.render('error', {message: err.message});
            }
        }
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.post('/login', async function (req, res) {
        let login = req.body.login;
        let user = await User.findOne({login: login});

        if (user){
            // пользователь есть, проверить пароль
            let password = req.body.password;
            let passwordResult = bcrypt.compareSync(password, user.password);
            if (passwordResult) {
                // Генерация токена
                let token = jwt.sign({
                    login: user.login,
                    userId: user._id
                }, keys.jwt, {expiresIn: 60 * 60}); // время жизни токена = 1 час
                res.status (200).json({
                    token: `Bearer ${token}`
                })
            } else {
                res.status(401).json({
                    message: 'Пароль не верный.'
                    //message: 'Неправильная пара login/password'
                });
            }
        } else {
            // пользователя нет, ошибка
            res.status(404).json({
                message: 'Пользователь с таким login не найден.'
                //message: 'Неправильная пара login/password'
            });
        }
    });
};
