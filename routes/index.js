const request = require('request');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const passport = require('passport');
let User = require('../models/userSchema').User;
const keys = require('../libs/jsonwebtoken');

let auth = passport.authenticate('jwt', {
    session: false
});

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
    //app.get('/users', function (req, res) {
        /*if(req.headers.authorization)
        {
            jwt.verify(req.headers.authorization.split(' ')[1], keys.jwt, function (err, payload) {
                if (err){
                    res.render('error', {message: err.message});
                    return;
                }
                User.find({}, function (err, users) {
                    if (err){
                        res.render('error', {message: err.message});
                        return;
                    }
                    //res.render('users', {users: users});  // для отладки
                    res.send(users);  // для отладки
                });
            })
        }*/
        User.find({}, function (err, users) {
            if (err){
                res.render('error', {message: err.message});
                return;
            }
            //res.render('users', {users: users});  // для отладки
            res.send(users);  // для отладки
        });
    });

    app.get('/user/:id', passport.authenticate('jwt', {session: false}), function (req, res) {
        //app.get('/user/:id', auth, function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (user == undefined) {
                res.render('error', {message: "Пользователя с таким id нет"});
            } else {
                res.json(user);
            }
        });
    });

    app.get('/register', function (req, res) {
        res.render('register', {message: ''});
    });

    app.post('/register', async function (req, res) {
        let login = req.body.login;
        let candidate = await User.findOne({login: login});

        if (candidate){
            // если такой пользователь есть
            res.render('register', {message: 'Такой login уже занят. Попробуйте другой'});
        } else {
            let password = req.body.password;
            let salt = bcrypt.genSaltSync(10);
            let newUser = new User({login: login, password: bcrypt.hashSync(password, salt)});
            try{
                await newUser.save();
                res.render('login', {message: 'Регистрация прошла успешно. Теперь можете войти в систему, используя свои данные.'})
            } catch(err){
                // обработка ошибки
                res.render('error', {message: err.message});
            }
        }
    });

    app.get('/login', function (req, res) {
        res.render('login', {message: ''});
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
                    message: 'Login success',
                    token: `Bearer ${token}`
                })
            } else {
                res.render('login', {message: 'Неправильная пара login/password. Попробуйте еще раз.'});
                /*res.status(401).json({
                    message: 'Пароль не верный.'
                    //message: 'Неправильная пара login/password'
                });*/
            }
        } else {
            // пользователя нет, ошибка
            res.render('login', {message: 'Неправильная пара login/password. Попробуйте еще раз.'});
            /*res.status(404).json({
                message: 'Пользователь с таким login не найден.'
                //message: 'Неправильная пара login/password'
            });*/
        }
    });
};
