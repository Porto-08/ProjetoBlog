// arquivo para estrutura a autenticação do ususario
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model de Usuarios
    require('../models/Usuario')
    const Usuario = mongoose.model('usuarios')

module.exports = function(passport){

    // Campo que queremos analisar, se fosse um Sistema por nome de Usuario, usuarios o nome, não o email unico.
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'Essa conta não existe'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Senha incorreta, tente novamente.'})
                }
            })
        })
    })) 

    // Para salvar os dados do Usuario em uma Sessão
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    //
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (erro, usuario) => {
            done(erro, usuario)
        })
    })
}