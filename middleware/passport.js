const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
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
};