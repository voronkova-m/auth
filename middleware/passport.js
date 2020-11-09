const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local'); //локальная стратегия авторизации
const keys = require('../libs/jsonwebtoken');
let User = require('../models/userSchema').User;



const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.jwt
}

module.exports = function (passport) {
    passport.use(
        new JwtStrategy(options, async function (payload, done) {
            try {
                let user = await User.findById(payload.userId).select('login id');
                if (user){
                    done(null, user);
                } else {
                    done(null, false);
                }
            } catch (e) {
                console.log(e);
            }
        })
    );

    passport.use(new LocalStrategy({
            usernameField: 'login',
            passwordField: 'password',
            session: false
        },
        function (login, password, done) {
            User.findOne({login}, (err, user) => {
                if (err) {
                    return done(err);
                }

                if (!user || !user.checkPassword(password)) {
                    return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
                }
                return done(null, user);
            });
        }
        )
    );
};