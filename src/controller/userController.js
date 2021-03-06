const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../model/User');


class AuthController{
    async register(req, res){
        const {email, password, password2, username} = req.body;
        try{
            if( await User.findOne( {email })){
               return res.status(400).json( { error: "Email já utilizado!"});
            }

            if ( password !== password2){
                return res.status(400).json({ error: "As senhas são diferentes"});
            }

            const user = await User.create( {
                email: email,
                password: password,
                username: username,
            });
            user.password = undefined; 
            const token = await user.generateToken();
            return res.json( { user , token});
        }catch (err) {
            return res.status(400).json({ error: "Registro falhou"});
        }
    }
    
    async login(req, res, next){
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if(err || !user){
                return res.status(400).json(info);
            }

            req.login(user, {session: false}, async (err) => {
                if(err){
                    return res.send(err);
                }
                const token = await user.generateToken();
                return res.json({user, token});
            });
        })(req, res);
    }

    async googleStrategy(req, res, next){
        passport.authenticate('google', {session:false}, (err, user, info) => {
            if(err || !user){
                return res.status(400).json("Error");
            }
            req.login(user, {session: false}, async(err) => {
                if(err){
                    return res.json(err);
                }
                const token = await user.generateToken();
                res.set('Content-Type', 'application/json');
                return res.json({user, token});
            });
        })(req, res);
    }

    async getUser(req, res) {
        return res.json(req.user);
    }

    async putUser(req, res){
        let id = req.user._id;
        let { username, descricao} = req.body;
        let user = await User.findByIdAndUpdate(id,{
            username: username,
            descricao: descricao,
        },
        {
            new: true,
        });
        if(!user) return sendStatus(400);
        return res.json(user);
    }

    async deleteUser(req, res){
        let id = req.user._id;
        let user = await User.findByIdAndDelete(id);
        if(!user) return res.sendStatus(400);
        return res.sendStatus(200);
    }
}

module.exports = new AuthController();